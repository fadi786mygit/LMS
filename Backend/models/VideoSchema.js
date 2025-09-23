const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  public_id: String,
  sourceType: { type: String, enum: ["upload", "external"], default: "upload" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
});

module.exports = mongoose.model("Video", VideoSchema);
