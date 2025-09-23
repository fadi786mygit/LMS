// config/cloudinary.js
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - file buffer (from multer memory storage)
 * @param {String} folder - cloudinary folder name
 * @param {String} mimetype - file mimetype (to decide resource_type)
 * @param {String} filename - optional filename for public_id
 */
const uploadToCloudinary = async (
  fileBuffer,
  folder = "lms_uploads",
  mimetype = "application/octet-stream",
  filename = Date.now().toString()
) => {
  return new Promise((resolve, reject) => {
    // Detect resource type
    let resourceType = "raw"; // fallback
    if (mimetype.startsWith("image")) resourceType = "image";
    else if (mimetype.startsWith("video")) resourceType = "video";
    else if (mimetype.includes("pdf") || mimetype.includes("msword") || mimetype.includes("officedocument"))
      resourceType = "raw";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        format: mimetype.includes("pdf") ? "pdf" : undefined, // force PDF format
        public_id: filename, // nice readable name
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
