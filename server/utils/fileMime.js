const fs = require("fs");

const SIGNATURES = [
  { mime: "video/webm", bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, extra: (buf) => buf.slice(8, 12).toString("ascii") === "WEBP" },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: "video/mp4", bytes: [0x00, 0x00, 0x00], check: (buf) => buf.length >= 12 && buf.slice(4, 8).toString("ascii") === "ftyp" },
  { mime: "audio/mpeg", bytes: [0xff, 0xfb] },
  { mime: "audio/mpeg", bytes: [0x49, 0x44, 0x33] },
  { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
];

const detectMimeFromFile = (filePath) => {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(16);
    fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);

    for (const sig of SIGNATURES) {
      const { bytes, mime, check, extra } = sig;
      const matches = bytes.every((b, i) => buf[i] === b);
      if (!matches) continue;
      if (check && !check(buf)) continue;
      if (extra && !extra(buf)) continue;
      return mime;
    }
  } catch {
    // fall through
  }
  return null;
};

module.exports = { detectMimeFromFile };
