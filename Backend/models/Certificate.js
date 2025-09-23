// In your Certificate model - FIXED VERSION
const mongoose = require("mongoose");

const certificateSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  issuedAt: { type: Date, default: Date.now },
  certificateId: { type: String, unique: true, required: true }, // ✅ Add required
  fileUrl: { type: String, required: true }, // ✅ Add required
  // Add these fields for better tracking
  status: { type: String, enum: ['issued', 'pending'], default: 'issued' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certificate", certificateSchema);