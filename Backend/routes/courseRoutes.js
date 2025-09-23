const express = require('express');
const router = express.Router();
const multer = require("multer");
const {
  getInstructorCourses,
  updateCourse,
  createCourse,
  getMyCourses,
  deleteCourse,
  getAllCourses,
  getCourseById,
  createCourseByInstructor,
  addQuizToCourse,
  getQuizzesByCourse,
  deleteQuiz,
  enrollInCourse,
  getCourseStudents,
  updateQuiz,
  getQuizById,
  getCourseContent,
  addContentToCourse,
  deleteCourseContent
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  // Add this to ensure proper parsing of form data
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});


router.post(
  '/createCourse',
  protect,
  authorize('instructor', 'admin'),
  createCourse
);

router.post(
  "/create-course",
  protect,
  upload.any(), 
  createCourseByInstructor
);

router.get(
  '/my-courses',
  protect,
  authorize('student'),
  getMyCourses
);

router.get(
  '/instructor',
  protect,
  authorize('instructor', 'admin'),
  getInstructorCourses
);

router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  upload.any(), // accept ANY field dynamically
  updateCourse
);

// Add this route to your courseRoutes.js
router.post(
  "/:courseId/add-content",
  protect,
  authorize("instructor", "admin"),
  upload.any(),
  addContentToCourse
);


router.delete(
  '/:id',
  protect,
  authorize('instructor', 'admin'),
  deleteCourse
);

router.get('/getallcourses', getAllCourses);
router.get('/:id/content', protect, getCourseContent);

// Quiz routes
router.post("/:courseId/quiz", addQuizToCourse);
router.get("/:courseId/quizzes", getQuizzesByCourse);
router.delete("/:courseId/quizzes/:quizId", protect, authorize("instructor"), deleteQuiz);
router.get('/:id', getCourseById);
router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);
router.get("/:courseId/students", protect, authorize("instructor"), getCourseStudents);
// Get single quiz by ID
router.get(
  "/:courseId/quizzes/:quizId",
  protect,
  authorize("instructor", "student"),
  getQuizById
);

// Update quiz
router.put(
  "/:courseId/quizzes/:quizId",
  protect,
  authorize("instructor"),
  updateQuiz
);

router.delete("/:id/content/:contentId", protect, authorize("instructor", "admin"), deleteCourseContent);


module.exports = router;