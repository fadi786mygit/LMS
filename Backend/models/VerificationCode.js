// models/VerificationCode.js
const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String },
  fullName: { type: String },
  phone: { type: String },
  role: { type: String, default: "student" }, 
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);
