const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload')
const { protect} = require('../middleware/authMiddleware');
const { downloadUserReport } = require("../controllers/adminController");

// Admin profile routes
router.get('/profile', protect, adminController.getAdminProfile);
router.put('/update', protect, adminController.updateAdminProfile);
router.post('/upload', protect, upload.single('profileImage'), adminController.uploadProfilePicture);
router.get("/download-user-report", adminController.downloadUserReport);



module.exports = router;
