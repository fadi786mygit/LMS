const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload')
const {
  getInstructorProfile,
  uploadInstructorProfilePicture,
  updateInstructorProfile,
  createRequest,
  getRequests,
  updateRequest,
  getCourseEnrollments,
} = require('../controllers/instructorController');

// Profile routes
router.get('/profile', protect, authorize('instructor'), getInstructorProfile);
router.post("/upload", protect, authorize("instructor"), upload.single("profileImage"), uploadInstructorProfilePicture);

router.put('/update', protect, authorize('instructor'), updateInstructorProfile);
router.post("/request", createRequest);
// Admin - view all requests
router.get("/requests", protect, authorize('admin'), getRequests);

// Admin - approve/reject request
router.put("/request/:id", protect, authorize('admin'), updateRequest);
router.get("/courses/:courseId/enrollments", protect, authorize('instructor'),getCourseEnrollments
);

module.exports = router;
