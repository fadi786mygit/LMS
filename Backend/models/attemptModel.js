
const mongoose = require("mongoose");


const attemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    selectedIndex: { type: Number, required: false },               
    isCorrect: { type: Boolean, default: false },
    score: { type: Number, default: 0 },                            
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    attemptNumber: { type: Number, default: 1 },
    status: { type: String, enum: ["in_progress", "submitted", "expired"], default: "in_progress" },
  },
  { timestamps: true }
);

// Ensure one active attempt per student per quiz
attemptSchema.index({ student: 1, course: 1, quiz: 1, status: 1 });

module.exports = mongoose.model("Attempt", attemptSchema);
