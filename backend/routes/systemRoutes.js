const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  exportBackup,
  restoreBackup,
  getAuditLogs,
  getSystemStats,
  getAdminsList,
  createAdminAccount
} = require('../controllers/systemController');

// All system routes are restricted to Super Admin role
router.use(protect);
router.use(authorize('superadmin'));

router.post('/backup', exportBackup);
router.post('/restore', restoreBackup);
router.get('/audit-logs', getAuditLogs);
router.get('/stats', getSystemStats);
router.get('/admins', getAdminsList);
router.post('/admins', createAdminAccount);

module.exports = router;
