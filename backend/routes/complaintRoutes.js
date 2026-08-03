const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadEvidence } = require('../middleware/uploadMiddleware');
const {
  createComplaint,
  getMyComplaints,
  getComplaintByCode,
  getMyNotifications,
  markNotificationRead
} = require('../controllers/complaintController');
const {
  getAllComplaints,
  updateComplaintStatus,
  updateComplaintNotes,
  revealIdentity,
  downloadPDF
} = require('../controllers/adminComplaintController');

// ==========================================
// CITIZEN ROUTING
// ==========================================

// POST /api/complaints - File a new report (Citizen only)
router.post(
  '/',
  protect,
  authorize('citizen'),
  uploadEvidence,
  createComplaint
);

// GET /api/complaints/my - Citizen's own submitted reports (Citizen only)
router.get(
  '/my',
  protect,
  authorize('citizen'),
  getMyComplaints
);

// ==========================================
// SHARED TRACKING ROUTING
// ==========================================

// GET /api/complaints/:complaintId - Track report by Complaint ID (Citizen owner/Admins)
router.get(
  '/:complaintId',
  protect,
  getComplaintByCode
);

// ==========================================
// ADMINISTRATIVE ROUTING
// ==========================================

// GET /api/complaints/admin/all - Admin search & inspect complaints (Admin/Super Admin)
router.get(
  '/admin/all',
  protect,
  authorize('admin', 'superadmin'),
  getAllComplaints
);

// PUT /api/complaints/admin/:id/status - Update status (Admin/Super Admin)
router.put(
  '/admin/:id/status',
  protect,
  authorize('admin', 'superadmin'),
  updateComplaintStatus
);

// PUT /api/complaints/admin/:id/notes - Add investigation notes (Admin/Super Admin)
router.put(
  '/admin/:id/notes',
  protect,
  authorize('admin', 'superadmin'),
  updateComplaintNotes
);

// GET /api/complaints/citizen/notifications - Get Citizen notifications (Citizen only)
router.get(
  '/citizen/notifications',
  protect,
  authorize('citizen'),
  getMyNotifications
);

// PUT /api/complaints/citizen/notifications/:id/read - Mark notification read (Citizen only)
router.put(
  '/citizen/notifications/:id/read',
  protect,
  authorize('citizen'),
  markNotificationRead
);

// GET /api/complaints/admin/:id/pdf - Download report PDF (Admin/Super Admin)
router.get(
  '/admin/:id/pdf',
  protect,
  authorize('admin', 'superadmin'),
  downloadPDF
);

// POST /api/complaints/admin/:id/reveal-identity - Reveal confidential citizen details (Super Admin only)
router.post(
  '/admin/:id/reveal-identity',
  protect,
  authorize('superadmin'),
  revealIdentity
);

module.exports = router;
