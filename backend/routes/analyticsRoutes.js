const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { getMapLocations } = require('../controllers/mapController');

// Restrict all routes in this file to Admin & Super Admin roles
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/summary', getAnalyticsSummary);
router.get('/map-locations', getMapLocations);

module.exports = router;
