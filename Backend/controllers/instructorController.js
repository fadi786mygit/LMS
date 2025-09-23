const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const asyncHandler = require("express-async-handler");
const InstructorRequest = require("../models/InstructorRequest");
const nodemailer = require('nodemailer');
const sendEmail = require("../utils/sendEmail");
const VerificationCode = require("../models/VerificationCode");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course"); 
const Certificate = require("../models/Certificate");
const { uploadToCloudinary } = require("../config/cloudinary");


// @desc    Get instructor profile
exports.getInstructorProfile = async (req, res) => {
    try {
        const instructor = await User.findById(req.user._id || req.user.id).select('-password');

        if (!instructor || instructor.role !== 'instructor') {
            return res.status(403).json({ message: 'Access denied. Not an instructor.' });
        }

        res.status(200).json({
            ...instructor.toObject(),
            profileImage: instructor.profileImage || `${req.protocol}://${req.get('host')}/images/default-image.png`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Upload instructor profile picture
exports.uploadInstructorProfilePicture = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const instructor = await User.findById(req.user.id);
    if (!instructor || instructor.role !== "instructor") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // ✅ Upload file buffer to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "instructor_profiles",   // Cloudinary folder
      req.file.mimetype,       // detect type
      `${instructor._id}-${Date.now()}` // unique public_id
    );

    // ✅ Delete old Cloudinary image if exists
    if (instructor.profileImagePublicId) {
      await cloudinary.uploader.destroy(instructor.profileImagePublicId);
    }

    // ✅ Save new Cloudinary URL + public_id
    instructor.profileImage = result.secure_url;
    instructor.profileImagePublicId = result.public_id;
    await instructor.save();

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: instructor.profileImage,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update instructor profile
exports.updateInstructorProfile = async (req, res) => {
    try {
        const instructor = await User.findById(req.user.id);
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const { fullName, email, currentPassword, newPassword, profileImage } = req.body;

        if (fullName) instructor.fullName = fullName;
        if (email) instructor.email = email;

        // ✅ Update profileImage (if provided from frontend)
        if (profileImage) {
            instructor.profileImage = profileImage;
        }

        // ✅ Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password required" });
            }
            const isMatch = await bcrypt.compare(currentPassword, instructor.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Current password incorrect" });
            }
            const salt = await bcrypt.genSalt(10);
            instructor.password = await bcrypt.hash(newPassword, salt);
        }

        await instructor.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            fullName: instructor.fullName,
            email: instructor.email,
            profileImage: instructor.profileImage,
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRequest = asyncHandler(async (req, res) => {
  const { fullName, email, phone, message } = req.body;

  const request = await InstructorRequest.create({
    fullName,
    email,
    phone,
    message,
  });

  res.status(201).json({ success: true, message: "Request submitted", request });
});

// 📌 Get all requests (Admin only)
exports.getRequests = asyncHandler(async (req, res) => {
  const requests = await InstructorRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

// 📌 Approve/Reject request
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.updateRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const request = await InstructorRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  request.status = status;
  await request.save();

  // Handle approve logic
  if (status === "approved") {
    let user = await User.findOne({ email: request.email });

    if (user) {
      // ✅ User already exists → just upgrade role
      user.role = "instructor";
      await user.save();

      const emailMessage = `
        <p>Congratulations <b>${request.fullName}</b>, you are now an instructor on our platform. 🎉</p>
        <p>You can continue using your existing account.</p>
      `;

      await sendEmail(request.email, "Instructor Approved", emailMessage);
    } else {
      // ✅ User does not exist → send 6-digit verification code
      const code = generateCode();

      // Save or update VerificationCode record
      await VerificationCode.findOneAndUpdate(
        { email: request.email },
        {
          email: request.email,
          username: request.email.split("@")[0] + Date.now(),
          fullName: request.fullName,
          role: "instructor", // 📌 important
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
        },
        { upsert: true, new: true }
      );

      // Link to frontend verify page
      const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:3000";

      const emailMessage = `
        <p>Congratulations <b>${request.fullName}</b>, your instructor request has been approved. 🎉</p>
        <p>Please verify your email using this 6-digit code:</p>
        <h2>${code}</h2>
        <p>Or click the link below to enter the code and set your password:</p>
        <a href="${frontendUrl}/verify-code?email=${encodeURIComponent(
        request.email
      )}">
          Verify Email & Set Password
        </a>
        <br><br>
        <p><i>This code will expire in 10 minutes.</i></p>
      `;

      await sendEmail(
        request.email,
        "Instructor Approval - Verify Email",
        emailMessage
      );
    }
  }

  // Handle reject logic
  if (status === "rejected") {
    await sendEmail(
      request.email,
      "Instructor Request Rejected",
      `<p>Sorry, your instructor request has been rejected.</p>`
    );
  }

  res.json({ success: true, message: `Request ${status}`, request });
});


exports.getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

    // Verify instructor owns this course
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(403).json({ message: "Not authorized for this course" });
    }

    // Get enrolled students
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("user", "fullName email")
      .select("progress");

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};