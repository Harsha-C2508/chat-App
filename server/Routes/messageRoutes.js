const express = require("express")
const { protect } = require("../Middlewares/authMiddleware");
const { sendMessage, allMessage, deleteMessage, markDelivered, markChatRead } = require("../Controller/messageController");

const router = express.Router();
router.route("/").post(protect, sendMessage);
router.put("/delivered/:messageId", protect, markDelivered);
router.put("/read/:chatId", protect, markChatRead);
router.route("/:chatId").get(protect, allMessage);
router.route("/delete/:messageId").put(protect, deleteMessage);

module.exports = router