const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

const populateMessage = (query) =>
  query
    .populate("sender", "name pic email")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name pic email" },
    });

const emitMessageStatus = (req, message) => {
  const io = req.app.get("io");
  if (!io || !message?.sender?._id) return;
  io.to(String(message.sender._id)).emit("message status", message);
};

const userInChat = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) return false;
  return chat.users.some((id) => String(id) === String(userId));
};

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, fileUrl, fileName, fileType, fileSize } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Invalid chat id");
  }

  if (!content && !fileUrl) {
    res.status(400);
    throw new Error("Message must have content or a file");
  }

  const newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    fileType: fileType || null,
    fileSize: fileSize || null,
  };

  let message = await Message.create(newMessage);
  message = await populateMessage(Message.findById(message._id));

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.json(message);
});

const allMessage = asyncHandler(async (req, res) => {
  const messages = await populateMessage(
    Message.find({ chat: req.params.chatId })
  );
  res.json(messages);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  if (String(message.sender) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only delete your own messages");
  }

  message.isDeleted = true;
  message.content = "";
  message.fileUrl = null;
  message.fileName = null;
  message.fileType = null;
  message.fileSize = null;
  await message.save();

  const updated = await populateMessage(Message.findById(messageId));
  res.json(updated);
});

const markDelivered = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const message = await Message.findById(messageId);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  if (!(await userInChat(message.chat, req.user._id))) {
    res.status(403);
    throw new Error("Not allowed");
  }

  if (String(message.sender) === String(req.user._id)) {
    const ownMessage = await populateMessage(Message.findById(messageId));
    res.json(ownMessage);
    return;
  }

  const alreadyDelivered = message.deliveredTo.some(
    (entry) => String(entry.user) === String(req.user._id)
  );

  if (!alreadyDelivered) {
    message.deliveredTo.push({ user: req.user._id, at: new Date() });
    await message.save();
  }

  const updated = await populateMessage(Message.findById(messageId));
  emitMessageStatus(req, updated);
  res.json(updated);
});

const markChatRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!(await userInChat(chatId, req.user._id))) {
    res.status(403);
    throw new Error("Not allowed");
  }

  const messages = await Message.find({
    chat: chatId,
    sender: { $ne: req.user._id },
    isDeleted: false,
  });

  const now = new Date();
  const updatedMessages = [];

  for (const message of messages) {
    let changed = false;

    if (!message.deliveredTo.some((entry) => String(entry.user) === String(req.user._id))) {
      message.deliveredTo.push({ user: req.user._id, at: now });
      changed = true;
    }

    if (!message.readBy.some((entry) => String(entry.user) === String(req.user._id))) {
      message.readBy.push({ user: req.user._id, at: now });
      changed = true;
    }

    if (changed) {
      await message.save();
      const populated = await populateMessage(Message.findById(message._id));
      updatedMessages.push(populated);
      emitMessageStatus(req, populated);
    }
  }

  res.json({ updated: updatedMessages.length, messages: updatedMessages });
});

module.exports = {
  allMessage,
  sendMessage,
  deleteMessage,
  markDelivered,
  markChatRead,
};
