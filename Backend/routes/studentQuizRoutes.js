// routes/studentQuizRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getCourseQuizzesForStudent,
  getSingleQuizForStudent,
} = require("../controllers/studentQuizController");

// Add middleware to debug the parameter
const debugParams = (req, res, next) => {
  console.log("Route params:", req.params);
  console.log("Course ID from params:", req.params.courseId);
  next();
};

// Student can view quizzes of a course
router.get(
  "/courses/:courseId/quizzes",
  debugParams, // Add debug middleware
  protect,
  authorize("student"),
  getCourseQuizzesForStudent
);

// Student can view a single quiz
router.get(
  "/courses/:courseId/quizzes/:quizId",
  debugParams, // Add debug middleware
  protect,
  authorize("student"),
  getSingleQuizForStudent
);



module.exports = router;