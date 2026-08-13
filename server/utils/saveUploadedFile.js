const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif",
  ".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v",
  ".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".txt", ".csv", ".zip", ".rar", ".7z",
];

const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
  "video/x-matroska": ".mkv",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "application/zip": ".zip",
};

const resolveExtension = (fileName, fileType) => {
  const ext = path.extname(fileName || "").toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) return ext;
  if (fileType && MIME_TO_EXT[fileType]) return MIME_TO_EXT[fileType];
  return ".bin";
};

const saveUploadedFile = (base64, fileName, maxSize = 25 * 1024 * 1024, fileType) => {
  if (!base64) {
    throw new Error("Missing file data");
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const buffer = Buffer.from(base64, "base64");

  if (buffer.length > maxSize) {
    throw new Error(`File too large (max ${Math.round(maxSize / 1024 / 1024)} MB)`);
  }

  const safeExt = resolveExtension(fileName, fileType);
  const uniqueName = `${crypto.randomBytes(12).toString("hex")}${safeExt}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${uniqueName}`;
};

module.exports = { saveUploadedFile, UPLOADS_DIR, ALLOWED_EXTENSIONS };
