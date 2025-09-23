// controllers/studentQuizController.js
const Course = require("../models/Course");

exports.getCourseQuizzesForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId exists and is not "undefined"
    if (!courseId || courseId === "undefined" || courseId === ":courseId") {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Validate courseId format
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: "Invalid course ID format",
        receivedId: courseId // Send back what was received for debugging
      });
    }

    const course = await Course.findById(courseId).select("title quizzes");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      course: { _id: course._id, title: course.title },
      quizzes: course.quizzes || [],
    });
  } catch (error) {
    console.error("Error in getCourseQuizzesForStudent:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};

exports.getSingleQuizForStudent = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;

    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid courseId format" });
    }

    const course = await Course.findById(courseId).select("title quizzes");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quiz = course.quizzes.id(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.json({ course: { _id: course._id, title: course.title }, quiz, score: quiz.score });
  } catch (error) {
    console.error("Error in getSingleQuizForStudent:", error);
    res.status(500).json({ message: error.message });
  }
};


