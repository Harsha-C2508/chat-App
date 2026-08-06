const asyncHandler = require("express-async-handler");
const fs = require("fs");
const { saveUploadedFile, UPLOADS_DIR } = require("../utils/saveUploadedFile");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const uploadFile = asyncHandler(async (req, res) => {
  const { base64, fileName, fileType, fileSize } = req.body;

  if (!base64 || !fileName || !fileType) {
    res.status(400);
    throw new Error("Missing file data");
  }

  const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
  if (fileSize && fileSize > MAX_SIZE) {
    res.status(400);
    throw new Error("File too large (max 25 MB)");
  }

  const fileUrl = saveUploadedFile(base64, fileName, MAX_SIZE, fileType);
  const buffer = Buffer.from(base64, "base64");

  res.json({ fileUrl, fileName, fileType, fileSize: buffer.length });
});

module.exports = { uploadFile };
