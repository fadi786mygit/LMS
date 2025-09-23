const multer = require("multer");
const path = require("path");

// Use memory storage so we can send buffer directly to Cloudinary
const storage = multer.memoryStorage();

const allowedMimeTypes = ["image/jpeg", "image/pjpeg", "image/png", "image/jpg"];
const allowedExtensions = /\.(jpeg|jpg|png)$/i;

const fileFilter = (req, file, cb) => {
  const isValidExtension = allowedExtensions.test(path.extname(file.originalname));
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (isValidExtension && isValidMimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG/JPG/PNG images are allowed!"), false);
  }
};

// Configure Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

module.exports = upload;
