const Complaint = require('../models/Complaint');
const { updateStatusSchema, updateNotesSchema } = require('../validators/complaintValidator');

/**
 * Retrieve all complaints with search filters.
 * Protected: Admin & Super Admin only.
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { complaintId, status, district, activityType, incidentDate } = req.query;
    const query = {};

    // 1. Apply Search and Filters
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
    
    // Validate request
    const { status } = updateStatusSchema.parse(req.body);

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint record not found.');
    }

    complaint.status = status;
    
    // Automatically elevate priority if status changes from Pending to Under Investigation
    if (status === 'Under Investigation' && complaint.priority === 'Waiting for AI') {
      complaint.priority = 'Medium'; // Default starting priority
    }

    // Push new status timeline entry
    complaint.timeline.push({
      status,
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
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

module.exports = {
  getAllComplaints,
  updateComplaintStatus,
  updateComplaintNotes
};
