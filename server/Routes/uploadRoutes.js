const express = require("express");
const { uploadFile } = require("../Controller/uploadController");
const { protect } = require("../Middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, uploadFile);

module.exports = router;
