const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Video = require("../models/VideoSchema");
const mongoose = require("mongoose");
const Course = require('../models/Course')

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "lms_videos",
    resource_type: "video",
    allowed_formats: ["mp4", "webm", "mkv"],
  },
});

const upload = multer({ 
  storage,
  // Add this to ensure proper parsing of form data
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// In your video upload route
// In your video upload route
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, description, courseId, externalUrl } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ error: "Title and courseId are required" });
    }

    // Validation: at least one of file or externalUrl must exist
    if (!req.file && !externalUrl) {
      return res.status(400).json({ error: "Please provide either a video file or an external video URL" });
    }

    let videoData = {
      title,
      description: description || "",
      courseId: new mongoose.Types.ObjectId(courseId),
    };

    if (req.file) {
      videoData.url = req.file.path;
      videoData.public_id = req.file.filename;
    } else if (externalUrl) {
      videoData.url = externalUrl; // Save external URL
      videoData.public_id = null; // Not from Cloudinary
    }

    const newVideo = new Video(videoData);
    await newVideo.save();

    // Also add to course content
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        content: {
          title: title,
          type: "video",
          url: videoData.url,
          videoId: newVideo._id,
        },
      },
    });

    res.json({ success: true, video: newVideo });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});


// Get all videos for a specific course
router.get("/course/:courseId", async (req, res) => {
  try {
    const videos = await Video.find({ courseId: req.params.courseId });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;