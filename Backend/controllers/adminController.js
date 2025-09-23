const Admin = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require("../models/User");
const { Parser } = require("json2csv");
const { uploadToCloudinary } = require("../config/cloudinary");

// @desc    Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id || req.user.id).select("-password");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    res.status(200).json({
      ...admin.toObject(),
      profileImage: admin.profileImage || null, // Cloudinary URL or null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admin profile (fullName, email, password)
// @desc    Upload or change profile picture
// Enhanced upload controller
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "lms_admin_profiles",
      req.file.mimetype,
      `admin_${admin._id}_${Date.now()}`
    );

    // Save Cloudinary URL
    admin.profileImage = result.secure_url;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Enhanced update controller
exports.updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { fullName, email, currentPassword, newPassword, profileImage } = req.body;

    if (fullName) admin.fullName = fullName;
    if (email) admin.email = email;

    // If frontend sends a Cloudinary URL, save it as is
    if (profileImage) {
      admin.profileImage = profileImage;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      fullName: admin.fullName,
      email: admin.email,
      profileImage: admin.profileImage || null,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.downloadUserReport = async (req, res) => {
  try {
    const users = await User.find({}, "fullName email role createdAt");

    const fields = ["fullName", "email", "role", "createdAt"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(users);

    res.header("Content-Type", "text/csv");
    res.attachment("user-report.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Error generating report", error: err });
  }
};