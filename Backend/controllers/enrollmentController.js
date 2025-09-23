// controllers/enrollmentController.js
const path = require("path");
const fs = require("fs");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const calculateProgress = require("../utils/calculateProgress");
const User = require("../models/User"); // ✅ ADD THIS IMPORT
const Certificate = require("../models/Certificate");
const { v4: uuidv4 } = require("uuid"); // for unique certificateId
const PDFDocument = require("pdfkit");
const asyncHandler = require("express-async-handler");


exports.markVideoCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoId } = req.body;
    const userId = req.user.id;

    // Find enrollment
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId })
      .populate("course")
      .populate("user");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Check if video already completed
    const alreadyCompleted = enrollment.completedContent.some(
      content => content.contentId.toString() === videoId
    );

    if (!alreadyCompleted) {
      // Add completed video
      enrollment.completedContent.push({
        contentId: videoId,
        completedAt: new Date(),
      });

      // Recalculate progress
      enrollment.progress = await calculateProgress(
        courseId,
        enrollment.completedContent
      );

      await enrollment.save();
    }

    let certificate = null;

    // ✅ If progress is 100%, auto-issue certificate
    if (enrollment.progress === 100) {
      const existingCert = await Certificate.findOne({ user: userId, course: courseId });

      if (!existingCert) {
        const certificateId = uuidv4();
        const fileName = `${certificateId}.pdf`;
        const filePath = path.join(__dirname, `../certificates/${fileName}`);

        // Generate PDF certificate
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(26).text("Certificate of Completion", { align: "center" });
        doc.moveDown(2);
        doc.fontSize(20).text(enrollment.user.fullName, { align: "center" });
        doc.moveDown(1);
        doc.fontSize(16).text("has successfully completed the course", { align: "center" });
        doc.moveDown(1);
        doc.fontSize(18).text(`"${enrollment.course.title}"`, { align: "center" });
        doc.moveDown(2);
        doc.fontSize(12).text(`Certificate ID: ${certificateId}`, { align: "center" });

        doc.end();

        await new Promise((resolve, reject) => {
          stream.on("finish", resolve);
          stream.on("error", reject);
        });

        // Save certificate to DB
        certificate = await Certificate.create({
          user: userId,
          course: courseId,
          certificateId,
          fileUrl: `/certificates/${fileName}`,
        });
      }
    }

    res.json({
      success: true,
      progress: enrollment.progress,
      message: alreadyCompleted
        ? "Video already completed"
        : "Video marked as completed",
      certificateIssued: certificate ? true : false,
      certificate,
    });
  } catch (error) {
    console.error("Error marking video as completed:", error);
    res.status(500).json({ error: error.message });
  }
};




exports.markContentAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { contentId } = req.body;
    const userId = req.user.id;

    let enrollment = await Enrollment.findOne({ user: userId, course: courseId })
      .populate("course")
      .populate("user");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // ✅ Check if already completed
    const alreadyCompleted = enrollment.completedContent.some(
      (item) => item.contentId && item.contentId.toString() === contentId
    );

    if (!alreadyCompleted) {
      enrollment.completedContent.push({
        contentId,
        completedAt: new Date(),
      });

      // ✅ Recalculate progress
      enrollment.progress = await calculateProgress(courseId, enrollment.completedContent);
      await enrollment.save();
    }

    res.json({
      message: alreadyCompleted
        ? "Content already completed"
        : "Content marked as completed",
      progress: enrollment.progress,
      completedContent: enrollment.completedContent,
    });
  } catch (error) {
    console.error("Error marking content as completed:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get user's progress for a specific course
exports.getUserCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).populate("completedContent.contentId");

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    // Always recalc progress from course.content
    enrollment.progress = await calculateProgress(
      courseId,
      enrollment.completedContent
    );
    await enrollment.save();

    res.json({
      progress: enrollment.progress,
      completedContent: enrollment.completedContent,
      totalItems: (await Course.findById(courseId)).content.length,
    });
  } catch (error) {
    console.error("Error getting user progress:", error);
    res.status(500).json({ error: error.message });
  }
};


// controllers/enrollmentController.js
exports.markContentCompleted = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { contentId } = req.body;


    let enrollment = await Enrollment.findById(enrollmentId).populate('course');

    if (!enrollment) {

      return res.status(404).json({ msg: "Enrollment not found" });
    }


    // Prevent duplicates - check if this content is already completed
    const contentIdStr = contentId.toString();
    const alreadyCompleted = enrollment.completedContent.some(
      c => c.contentId && c.contentId.toString() === contentIdStr
    );

    if (!alreadyCompleted) {

      // Add the content to completed content
      enrollment.completedContent.push({
        contentId: contentId,
        completedAt: new Date()
      });

      // Recalculate progress
      enrollment.progress = await calculateProgress(
        enrollment.course._id,
        enrollment.completedContent
      );

      await enrollment.save();

    } else {

    }

    res.json({
      message: "Content marked as completed",
      progress: enrollment.progress,
    });
  } catch (err) {
    console.error("❌ Error in markContentCompleted:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


exports.enrollUser = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id; // from auth middleware

    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get progress of a course for a user
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
      .populate("course");

    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    res.json({
      course: enrollment.course.title,
      progress: enrollment.progress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update progress (e.g., after completing video/quiz/assignment)

exports.updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;
    // percentage from frontend
    const userId = req.user.id; // ✅
    //  Update progress
    const enrollment = await Enrollment.findOneAndUpdate({ user: userId, course: courseId },
      { $set: { progress, completed: progress === 100 } },
      { new: true }).populate("course user");
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    } // ✅ If progress = 100, auto-issue certificate 
    if (progress === 100) {
      const existingCert = await Certificate.findOne({ user: userId, course: courseId, });
      if (!existingCert) {
        const cert = new Certificate({ user: userId, course: courseId, certificateId: uuidv4(), issueDate: new Date(), });
        await cert.save();
      }
    }
    res.json({ message: "Progress updated", enrollment });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get all courses a user is enrolled in (with progress)
exports.getUserEnrollments = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the requesting user has access to this data
    if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'student') {
      return res.status(403).json({ error: "Access denied" });
    }

    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: "course",
        select: "title description thumbnail", // ✅ FIXED: use object format for populate
      })
      .lean();

    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: "Server error" });
  }
};