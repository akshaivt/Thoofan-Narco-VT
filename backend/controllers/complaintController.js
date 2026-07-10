const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const cloudinaryService = require('../services/cloudinaryService');
const { createComplaintSchema } = require('../validators/complaintValidator');
const { analyzeComplaintText } = require('../services/geminiService');
const { checkDuplicateScore } = require('../utils/similarity');

/**
 * File a new drug activity complaint.
 * Protected: Citizen role only.
 */
const createComplaint = async (req, res, next) => {
  try {
    // 1. Zod validation
    const parsedData = createComplaintSchema.parse(req.body);

    // 2. Upload evidence files
    const evidenceImages = [];
    const evidenceVideos = [];

    if (req.files) {
      // Process images
      if (req.files.images) {
        for (const file of req.files.images) {
          const fileUrl = await cloudinaryService.uploadFile(file.path);
          evidenceImages.push(fileUrl);
        }
      }

      // Process videos
      if (req.files.videos) {
        for (const file of req.files.videos) {
          const fileUrl = await cloudinaryService.uploadFile(file.path);
          evidenceVideos.push(fileUrl);
        }
      }
    }

    // 3. Compute Duplicate Score
    const duplicateScore = await checkDuplicateScore({
      district: parsedData.district,
      place: parsedData.place,
      incidentDate: parsedData.incidentDate,
      description: parsedData.description
    });

    // 4. Run Gemini AI Intelligence Analysis
    const aiResult = await analyzeComplaintText(parsedData.description, parsedData.activityType);

    // 5. Create database entry
    const newComplaint = await Complaint.create({
      ...parsedData,
      citizenId: req.user.id,
      evidenceImages,
      evidenceVideos,
      status: 'Pending',
      priority: 'Waiting for AI',
      notes: [],
      timeline: [
        {
          status: 'Pending',
          updatedBy: req.user.id,
          updatedAt: new Date()
        }
      ],
      aiSummary: aiResult.aiSummary,
      aiCategory: aiResult.aiCategory,
      aiPriority: aiResult.aiPriority,
      riskLevel: aiResult.riskLevel,
      aiSuggestions: aiResult.aiSuggestions,
      duplicateScore
    });

    res.status(201).json({
      success: true,
      message: 'Report Submitted Successfully',
      complaintId: newComplaint.complaintId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current Citizen's own filed reports.
 * Protected: Citizen role only.
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track complaint state using Complaint ID (OTF-YYYY-XXXXXX).
 * Protected: Citizen (own only), Admin (all), Super Admin (all).
 */
const getComplaintByCode = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    // Find complaint and populate citizen details
    const complaint = await Complaint.findOne({ complaintId })
      .populate('citizenId', 'name email phone');

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint record not found.');
    }

    const requesterRole = req.user.role;
    const requesterId = req.user.id;

    // Security Gate: Citizens can only track their own complaints
    if (requesterRole === 'citizen' && complaint.citizenId._id.toString() !== requesterId) {
      res.status(403);
      throw new Error('Access Denied: You are not authorized to track this complaint.');
    }

    // Masking: Mask reporter identity for standard Admin roles if complaint is confidential
    let formattedComplaint = complaint.toObject();
    
    if (complaint.isConfidential) {
      if (requesterRole === 'admin' || requesterRole === 'superadmin') {
        // Both Admin and Super Admin: Mask identity.
        // Preparing system for a future "Reveal Identity" feature in Phase 4.
        formattedComplaint.citizenDetails = { name: 'Confidential' };
        delete formattedComplaint.citizenId;
      } else {
        // Owner Citizen: Shows details
        formattedComplaint.citizenDetails = {
          name: complaint.citizenId.name,
          email: complaint.citizenId.email,
          phone: complaint.citizenId.phone
        };
      }
    } else {
      // Not confidential -> Show reporter details
      formattedComplaint.citizenDetails = {
        name: complaint.citizenId ? complaint.citizenId.name : 'Unknown',
        email: complaint.citizenId ? complaint.citizenId.email : '',
        phone: complaint.citizenId ? complaint.citizenId.phone : ''
      };
    }

    res.status(200).json({
      success: true,
      complaint: formattedComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current Citizen's notification history.
 * Protected: Citizen role only.
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const list = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
      
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: list
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark citizen notification as read.
 * Protected: Citizen role only.
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!notification) {
      res.status(404);
      throw new Error('Notification record not found.');
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintByCode,
  getMyNotifications,
  markNotificationRead
};
