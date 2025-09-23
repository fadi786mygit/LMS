const Certificate = require("../models/Certificate");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { v4: uuidv4 } = require("uuid");
const PDFDocument = require("pdfkit");
const asyncHandler = require("express-async-handler");
const  {uploadToCloudinary} = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

// ✅ Issue certificate (by instructor)
exports.issueCertificateByInstructor = asyncHandler(async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const instructorId = req.user.id;

    // Ensure course belongs to instructor
    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) {
      return res.status(403).json({ message: "You are not the instructor of this course" });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({ user: studentId, course: courseId })
      .populate("user")
      .populate("course");

    if (!enrollment) {
      return res.status(404).json({ message: "Student not enrolled in this course" });
    }

    // Check if already issued
    const existingCert = await Certificate.findOne({ user: studentId, course: courseId });
    if (existingCert) {
      return res.json({
        message: "Certificate already issued for this student",
        certificate: existingCert,
      });
    }

    // Generate PDF
    const certificateId = uuidv4();
    const doc = new PDFDocument({ layout: "landscape" });

    let chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        // ✅ Upload to Cloudinary
        const uploadRes = await uploadToCloudinary(pdfBuffer, "lms_certificates", "application/pdf");

        // Save in DB
        const certificate = await Certificate.create({
          user: studentId,
          course: courseId,
          certificateId,
          fileUrl: uploadRes.secure_url,
          issuedAt: new Date(),
        });

        res.json({
          message: "Certificate issued successfully by instructor",
          certificate,
        });
      } catch (err) {
        console.error("❌ Cloudinary upload error:", err);
        res.status(500).json({ message: "Error uploading certificate" });
      }
    });

    // ✅ Draw certificate content
    doc.fontSize(36)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Certificate of Completion", 0, 150, { align: "center" });

    doc.moveDown(1.5);
    doc.fontSize(24)
      .fillColor("#16a085")
      .text(enrollment.user.fullName, 0, 220, { align: "center" });

    doc.moveDown(1);
    doc.fontSize(18)
      .fillColor("#2c3e50")
      .text("has successfully completed the course", 0, 280, { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(20)
      .fillColor("#e74c3c")
      .text(`"${enrollment.course.title}"`, 0, 320, { align: "center" });

    doc.moveDown(2);
    doc.fontSize(12)
      .fillColor("#7f8c8d")
      .text(`Certificate ID: ${certificateId}`, 0, 400, { align: "center" });

    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 0, 420, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ Instructor certificate error:", error);
    res.status(500).json({
      message: "Server error during instructor certificate generation",
      error: error.message,
    });
  }
});

// ✅ Download certificate - FIXED VERSION
const axios = require("axios");

exports.downloadCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const certificate = await Certificate.findOne({ certificateId: certId })
      .populate("course")
      .populate("user");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (!certificate.fileUrl) {
      return res.status(404).json({ message: "Certificate file URL missing" });
    }

    // Fetch the PDF from Cloudinary
    const response = await axios.get(certificate.fileUrl, { responseType: "arraybuffer" });

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${certificate.user.fullName}_${certificate.course.title}_certificate.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Send the PDF data
    res.send(response.data);

  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ message: "Server error while downloading certificate" });
  }
};


// ✅ Get user certificates
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const certs = await Certificate.find({ user: userId }).populate("course");
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching certificates" });
  }
};

// FIXED certificate generation function
exports.issueCertificate = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check enrollment and progress
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
      .populate("course")
      .populate("user");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (Math.round(enrollment.progress) < 100) {
      return res.status(400).json({
        message: `Course not completed. Current progress: ${enrollment.progress}%`,
      });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ user: userId, course: courseId });
    if (existingCert) {
      return res.json({
        message: "Certificate already issued",
        certificate: existingCert,
      });
    }

    // Generate PDF into Buffer
    const certificateId = uuidv4();
    const doc = new PDFDocument({ layout: "landscape" });

    let chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        // ✅ Upload to Cloudinary
        const uploadRes = await uploadToCloudinary(pdfBuffer, "lms_certificates", "application/pdf");

        // Save in DB
        const certificate = await Certificate.create({
          user: userId,
          course: courseId,
          certificateId,
          fileUrl: uploadRes.secure_url,
          issuedAt: new Date(),
        });

        res.json({
          message: "Certificate issued successfully",
          certificate,
        });
      } catch (err) {
        console.error("❌ Cloudinary upload error:", err);
        res.status(500).json({ message: "Error uploading certificate" });
      }
    });

    // ✅ Draw certificate content
    doc.fontSize(36)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Certificate of Completion", 0, 150, { align: "center" });

    doc.moveDown(1.5);
    doc.fontSize(24)
      .fillColor("#16a085")
      .text(enrollment.user.fullName, 0, 220, { align: "center" });

    doc.moveDown(1);
    doc.fontSize(18)
      .fillColor("#2c3e50")
      .text("has successfully completed the course", 0, 280, { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(20)
      .fillColor("#e74c3c")
      .text(`"${enrollment.course.title}"`, 0, 320, { align: "center" });

    doc.moveDown(2);
    doc.fontSize(12)
      .fillColor("#7f8c8d")
      .text(`Certificate ID: ${certificateId}`, 0, 400, { align: "center" });

    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 0, 420, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ Certificate generation error:", error);
    res.status(500).json({
      message: "Server error during certificate generation",
      error: error.message,
    });
  }
});



// ✅ Verify certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const certificate = await Certificate.findOne({ certificateId: certId })
      .populate("user", "fullName email")
      .populate("course", "title");

    if (!certificate) {
      return res.status(404).json({ verified: false, message: "Certificate not found" });
    }

    res.json({
      verified: true,
      certificateId: certificate.certificateId,
      user: certificate.user,
      course: certificate.course.title,
      issuedOn: certificate.issuedAt, // ✅ Fixed: changed from issueDate to issuedAt
      fileUrl: certificate.fileUrl
    });
  } catch (err) {
    console.error("❌ Certificate verification error:", err);
    res.status(500).json({ verified: false, message: "Server error" });
  }
};