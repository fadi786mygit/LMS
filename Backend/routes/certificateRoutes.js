const express = require("express");
const router = express.Router();
const { 
  getUserCertificates, 
  issueCertificate,
  downloadCertificate,
  issueCertificateByInstructor,
  verifyCertificate
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ Protected routes
router.get("/my", protect, getUserCertificates);

router.get("/download/:certId", protect, downloadCertificate);
router.post("/:courseId/issue/:studentId", protect, issueCertificateByInstructor);
router.get("/verify/:certId", verifyCertificate);
router.post("/issue/:courseId", protect, authorize('student', 'instructor'), issueCertificate);



module.exports = router;
