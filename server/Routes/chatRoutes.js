const express = require("express")
const { protect } = require("../Middlewares/authMiddleware")
const { accessChat, fetchChat, createGroupChat, removeGroup, removeFromGroup, addToGroup } = require("../Controller/chatController")

const router = express.Router()
router.post("/",protect,accessChat)
router.get("/",protect,fetchChat)
router.post("/group",protect,createGroupChat)
router.put("/rename",protect,removeGroup)
router.put("/groupremove",protect,removeFromGroup)
router.put("/groupadd",protect,addToGroup)

module.exports = router