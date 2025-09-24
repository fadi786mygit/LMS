// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  enrollUser,
  markContentCompleted,
  getCourseProgress,
  getUserEnrollments,
  markVideoCompleted,
  getUserCourseProgress,
  markContentAsCompleted
} = require("../controllers/enrollmentController");

// Enroll in a course
router.post("/enroll", protect, enrollUser);




router.post('/:courseId/complete-content', protect, markContentAsCompleted);

// Mark content as completed (using enrollment ID)
router.post("/:enrollmentId/complete", protect, markContentCompleted);

// Mark video as completed (using course ID) - NEW ROUTE
router.post("/:courseId/complete-video", protect, markVideoCompleted);

// Get progress of a specific course (using course ID) - NEW ROUTE
router.get("/:courseId/user-progress", protect, getUserCourseProgress);

// Get progress of a specific course (existing)
router.get("/:courseId/progress", protect, getCourseProgress);

router.get("/user/:userId", protect, getUserEnrollments);



module.exports = router;