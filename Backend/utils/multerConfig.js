const multer = require("multer");

// Store files in memory instead of saving locally
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
