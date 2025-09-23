// Example: routes/progress.js
const express = require("express");
const Enrollment = require("../models/Enrollment");
const calculateProgress = require("../utils/calculateProgress");

const router = express.Router();

router.post("/:courseId/complete-content", async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Prevent duplicates
    const alreadyCompleted = enrollment.completedContent.some(
      (c) => c.contentId.toString() === req.body.contentId
    );

    if (!alreadyCompleted) {
      enrollment.completedContent.push({
        contentId: req.body.contentId,
        completedAt: new Date(),
      });
    }

    // ✅ Recalculate and update progress
    enrollment.progress = await calculateProgress(courseId, enrollment.completedContent);
    await enrollment.save();


    res.json({
      message: "Progress updated successfully",
      progress: enrollment.progress,
      completedContent: enrollment.completedContent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
