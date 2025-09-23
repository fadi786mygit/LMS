const VerificationCode = require('../models/VerificationCode');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ Verify Code
const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const record = await VerificationCode.findOne({ email, code });

  if (!record) {
    return res.status(400).json({ message: "Invalid verification code." });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: "Verification code has expired." });
  }

  res.status(200).json({
    message: "Email verified successfully.",
    email,
    username: record.username || '', // maybe empty if forgot-password
  });
};

// ✅ Set Password (for both Registration and Forgot Password)
// ✅ Set Password (for both Registration and Forgot Password)
const setPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const verified = await VerificationCode.findOne({ email });
  if (!verified) {
    return res.status(400).json({ message: "Email not verified or expired." });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    // 🔁 FORGOT PASSWORD FLOW
    const salt = await bcrypt.genSalt(10);
    existingUser.password = await bcrypt.hash(password, salt);
    await existingUser.save();

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      message: "Password reset successfully.",
      token,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
    });
  } else {
    // 🆕 REGISTRATION FLOW
    const { username, fullName, phone, role } = verified; // ✅ role comes from VerificationCode

    if (!username || !fullName) {
      return res
        .status(400)
        .json({ message: "Incomplete verification data." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "student", // ✅ fallback to student if not provided
      isVerified: true,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  }
};


module.exports = {
  verifyCode,
  setPassword,
};
