const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  fileUrl: String,
  maxMarks: { type: Number, default: 100 },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fileUrl: String,
      submittedAt: { type: Date, default: Date.now },
      marks: { type: Number, default: null },
    },
  ],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, default: "General" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    price: { type: Number, default: 0 },
    thumbnail: { type: String },
    content: [
      {
        ctitle: String,
        type: { type: String, enum: ["video", "pdf"], default: "video" },
        url: String,
        duration: Number,
        videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      },
    ],
    quizzes: [quizSchema],
    assignments: [assignmentSchema],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
