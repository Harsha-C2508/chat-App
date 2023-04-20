const express = require("express");
const { registerUser, authUser, allUser } = require("../Controller/userController");
const { protect } = require("../Middlewares/authMiddleware");

const router = express.Router()
router.route("/").post(registerUser)
router.post("/login",authUser)
router.get("/", protect ,allUser)
module.exports = router