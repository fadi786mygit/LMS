// routes/attemptRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  startAttempt,
  submitAttempt,
  getMyAttempts,
  expireAttempt,
  checkAttempt
} = require("../controllers/attemptController");

router.post("/start", protect, authorize("student"), startAttempt);
router.post("/submit", protect, authorize("student"), submitAttempt);
router.get("/my", protect, authorize("student"), getMyAttempts);
router.get('/check', protect, authorize("student"), checkAttempt);
router.post('/expire', protect, authorize("student"), expireAttempt);

module.exports = router;
