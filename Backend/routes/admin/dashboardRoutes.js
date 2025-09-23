const express = require('express');
const router = express.Router();
const { getAdminDashboard } = require('../../controllers/admin/dashboardController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.get('/overview', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
