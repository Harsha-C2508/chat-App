const express = require("express")
const { protect } = require("../Middlewares/authMiddleware");
const { sendMessage, allMessage} = require("../Controller/messageController");

const router = express.Router();
router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessage);

module.exports = router