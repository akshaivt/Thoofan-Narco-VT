const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mailService = require('../services/mailService');
const pdfService = require('../services/pdfService');
const { decrypt, encrypt } = require('../services/encryptionService');
const { updateStatusSchema, updateNotesSchema } = require('../validators/complaintValidator');

/**
 * Retrieve all complaints with search filters.
 * Protected: Admin & Super Admin only.
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { complaintId, status, district, activityType, incidentDate } = req.query;
    const query = {};

    // 1. Station Officer filter: limit complaints to their assigned police station
    if (req.user.role === 'admin' && req.user.policeStation) {
      query.nearestPoliceStation = req.user.policeStation;
    }

    // 2. Apply Search and Filters
    if (complaintId) {
      // Regex case-insensitive match for partial search
      query.complaintId = { $regex: complaintId.trim(), $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (district) {
      query.district = { $regex: district.trim(), $options: 'i' };
    }
    if (activityType) {
      query.activityType = { $regex: activityType.trim(), $options: 'i' };
    }
    if (incidentDate) {
      // Find incidents on this specific day (00:00:00 to 23:59:59)
      const startDate = new Date(incidentDate);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(incidentDate);
      endDate.setUTCHours(23, 59, 59, 999);
      
      query.incidentDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // 2. Fetch and populate citizen info
    const complaints = await Complaint.find(query)
      .populate('citizenId', 'name email phone')
      .sort({ createdAt: -1 });

    const requesterRole = req.user.role;

    // 3. Apply confidential masking depending on role
    const formattedComplaints = complaints.map(complaint => {
      const item = complaint.toObject();
      
      if (item.isConfidential) {
        if (requesterRole === 'admin' || requesterRole === 'superadmin') {
          // Masks reporter identity for standard Admin and Super Admin roles.
          item.citizenDetails = { name: 'Confidential' };
          delete item.citizenId;
        }
      } else {
        // Not confidential: Display details
        item.citizenDetails = {
          name: item.citizenId ? item.citizenId.name : 'Unknown',
          email: item.citizenId ? item.citizenId.email : '',
          phone: item.citizenId ? item.citizenId.phone : ''
        };
      }
      return item;
    });

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      complaints: formattedComplaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint resolution/investigation status.
 * Protected: Admin & Super Admin only.
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate request parameters (status and priority are optional)
    const { status, priority } = updateStatusSchema.parse(req.body);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint record not found.');
    }

    if (status && status !== complaint.status) {
      complaint.status = status;
      
      // Push new status timeline entry
      complaint.timeline.push({
        status,
        updatedBy: req.user.id,
        updatedAt: new Date()
      });

      // Automatically elevate priority if status changes from Pending to Under Investigation
      if (status === 'Under Investigation' && complaint.priority === 'Waiting for AI') {
        complaint.priority = 'Medium';
      }

      // Fetch citizen to dispatch alerts
      const citizen = await User.findById(complaint.citizenId);
      if (citizen) {
        // Create Dashboard Notification record
        await Notification.create({
          userId: citizen._id,
          complaintId: complaint._id,
          message: `Your complaint ID ${complaint.complaintId} has been updated to: ${status}.`,
          type: 'STATUS_CHANGE'
        });

        // Dispatch Nodemailer Email
        const citizenEmail = decrypt(citizen.email);
        const citizenName = decrypt(citizen.name);
        await mailService.sendStatusAlert(citizenEmail, citizenName, complaint.complaintId, status);
      }
    }

    if (priority) {
      complaint.priority = priority;
    }

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add / Update official investigation notes.
 * Protected: Admin & Super Admin only.
 */
const updateComplaintNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate request: extracts note property
    const { note } = updateNotesSchema.parse(req.body);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint record not found.');
    }

    // Push new note subdocument
    complaint.notes.push({
      adminId: req.user.id,
      note,
      createdAt: new Date()
    });

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Investigation note added successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reveal confidential reporter details.
 * Protected: Super Admin only.
 */
const revealIdentity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      res.status(400);
      throw new Error('Mandatory disclosure reason is required to reveal identity.');
    }

    const complaint = await Complaint.findById(id).populate('citizenId');
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint record not found.');
    }

    // Security check: Only superadmin role
    if (req.user.role !== 'superadmin') {
      res.status(403);
      throw new Error('Access Denied: Only Super Administrator can reveal reporter identities.');
    }

    // Write to AuditLog
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await AuditLog.create({
      userId: req.user.id,
      complaintId: complaint._id,
      action: 'REVEAL_IDENTITY',
      reason: reason.trim(),
      ipAddress
    });

    // Decrypt details

    const report={

      name:encrypt(complaint.citizenId.name),
      email:decrypt(complaint.citizenId.email),
      phone:decrypt(complaint.citizenId.email)

}




    const reporter = {
      name: decrypt(complaint.citizenId.name),
      email: decrypt(complaint.citizenId.email),
      phone: decrypt(complaint.citizenId.phone)
    };

    res.status(200).json({
      success: true,
      message: 'Identity revealed successfully. Audit log recorded.',
      reporter
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate and download PDF case ledger.
 * Protected: Admin & Super Admin only.
 */
const downloadPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate('citizenId');
    
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint record not found.');
    }

    // Create a copy and decrypt citizen if NOT confidential
    const printableComplaint = complaint.toObject();
    if (printableComplaint.isConfidential) {
      printableComplaint.citizenDetails = { name: 'Confidential' };
    } else {
      printableComplaint.citizenDetails = {
        name: decrypt(complaint.citizenId?.name || ''),
        email: decrypt(complaint.citizenId?.email || ''),
        phone: decrypt(complaint.citizenId?.phone || '')
      };
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=NarcoVT_Report_${complaint.complaintId}.pdf`
    );

    // Call PDF generator service
    pdfService.buildComplaintPDF(printableComplaint, res);
  } catch (error) {
    next(error);
  }
};







module.exports = {
  getAllComplaints,
  updateComplaintStatus,
  updateComplaintNotes,
  revealIdentity,
  downloadPDF
};
