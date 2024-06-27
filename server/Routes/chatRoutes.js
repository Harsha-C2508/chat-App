const express = require("express")
const { protect } = require("../Middlewares/authMiddleware")
const { accessChat, fetchChat, createGroupChat, renameGroup, removeFromGroup, addToGroup } = require("../Controller/chatController")

const router = express.Router()
router.route("/").post(protect,accessChat)
router.get("/",protect,fetchChat)
router.post("/group",protect,createGroupChat)
router.put("/rename",protect,renameGroup)
router.put("/groupremove",protect,removeFromGroup)
router.put("/groupadd",protect,addToGroup)

module.exports = router