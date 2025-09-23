// config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dq0u0zdle",
  api_key: "346952289318691",
  api_secret: "b0Zkl23JBi-dYmr8i19w2FpKGcA",
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
