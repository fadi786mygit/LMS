// controllers/attemptController.js
const Attempt = require("../models/attemptModel");
const Course = require("../models/Course");

/**
 * POST /api/attempts/start
 * body: { courseId, quizId }
 * Role: student
 * Creates (or returns existing in_progress) attempt if quiz is still open.
 */
// controllers/attemptController.js

exports.startAttempt = async (req, res) => {
  try {
    const { courseId, quizId } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId).select("quizzes");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quiz = course.quizzes.id(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Check endTime
    if (quiz.endTime && new Date(quiz.endTime) < new Date()) {
      return res.status(400).json({ message: "Quiz has ended" });
    }

    // ⚡ 1) Agar already koi in_progress attempt hai → wahi return karo
    let attempt = await Attempt.findOne({
      student: studentId,
      course: courseId,
      quiz: quizId,
      status: "in_progress",
    });

    if (attempt) {
      return res.status(200).json(attempt); // new na banao
    }

    // ⚡ 2) Naya attempt banao
    const attemptCount = await Attempt.countDocuments({
      student: studentId,
      course: courseId,
      quiz: quizId,
    });

    attempt = await Attempt.create({
      student: studentId,
      course: courseId,
      quiz: quizId,
      status: "in_progress",
      attemptNumber: attemptCount + 1,
    });

    res.status(201).json(attempt);
  } catch (error) {
    console.error("Start attempt error:", error);
    res.status(500).json({ message: error.message });
  }
};



/**
 * POST /api/attempts/submit
 * body: { courseId, quizId, selectedIndex }
 * Role: student
 * Submits an attempt (scores 0 or 1).
 */
/**
 * POST /api/attempts/submit
 * body: { courseId, quizId, selectedIndex }
 * Role: student
 * Submits an attempt (scores 0 or 1).
 */
exports.submitAttempt = async (req, res) => {
  try {
    const { courseId, quizId, selectedIndex } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId).select("quizzes");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const quiz = course.quizzes.id(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Check endTime
    if (quiz.endTime && new Date(quiz.endTime) < new Date()) {
      return res.status(400).json({ message: "Quiz time has ended" });
    }

    // Find latest in_progress attempt
    let attempt = await Attempt.findOne({
      student: studentId,
      course: courseId,
      quiz: quizId,
      status: "in_progress",
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ message: "No in_progress attempt found" });
    }

    // Score
    const isCorrect = parseInt(selectedIndex) === parseInt(quiz.correctAnswer);
    
    attempt.score = isCorrect ? 1 : 0;
    attempt.selectedIndex = selectedIndex;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();
    attempt.isCorrect = isCorrect;
    await attempt.save();

    res.json({ message: "Attempt submitted", attempt });
  } catch (error) {
    console.error("Submit attempt error:", error);
    res.status(500).json({ message: error.message });
  }
};


/**
 * GET /api/attempts/my?courseId=...&quizId=...
 * Role: student
 * Returns student's attempts (filtered).
 */
exports.getMyAttempts = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId, quizId } = req.query;

    const filter = { student: studentId };
    if (courseId) filter.course = courseId;
    if (quizId) filter.quiz = quizId;

    const attempts = await Attempt.find(filter).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.expireAttempt = async (req, res) => {
  try {
    const { courseId, quizId } = req.body;
    const studentId = req.user?._id;

    if (!studentId || !courseId || !quizId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedAttempt = await Attempt.findOneAndUpdate(
      { student: studentId, course: courseId, quiz: quizId, status: "in_progress" },
      { status: "expired", score: 0, submittedAt: new Date() },
      { new: true }
    );

    if (!updatedAttempt) {
      return res.status(404).json({ message: "No in_progress attempt found" });
    }

    res.json(updatedAttempt);
  } catch (error) {
    console.error("Expire Attempt Error:", error);
    res.status(500).json({ message: error.message }); 
  }
};



/**
 * GET /api/attempts/check?courseId=...&quizId=...
 * Role: student
 * Checks if student has already attempted a quiz
 */
exports.checkAttempt = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId, quizId } = req.query;

    const attempt = await Attempt.findOne({
      student: studentId,
      course: courseId,
      quiz: quizId,
      status: { $in: ["submitted", "expired"] }
    });

    res.json({
      alreadyAttempted: !!attempt,
      previousScore: attempt ? attempt.score : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};