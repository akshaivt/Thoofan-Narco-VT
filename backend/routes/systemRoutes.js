const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  exportBackup,
  restoreBackup,
  getAuditLogs,
  getSystemStats,
  getAdminsList,
  createAdminAccount,
  getPoliceStations,
  addPoliceStation
} = require('../controllers/systemController');

// All system routes require authentication
router.use(protect);

// Citizens and Admins can fetch police stations list
router.get('/police-stations', getPoliceStations);

// Only Super Admins can manage system, backups, audits and stations
router.use(authorize('superadmin'));

router.post('/backup', exportBackup);
router.post('/restore', restoreBackup);
router.get('/audit-logs', getAuditLogs);
router.get('/stats', getSystemStats);
router.get('/admins', getAdminsList);
router.post('/admins', createAdminAccount);
router.post('/police-stations', addPoliceStation);

module.exports = router;
