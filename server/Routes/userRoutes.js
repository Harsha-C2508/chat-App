const express = require("express");
const { registerUser, authUser, allUser, updateProfile, googleAuth, forgotPassword, resetPassword } = require("../Controller/userController");
const { protect } = require("../Middlewares/authMiddleware");

const router = express.Router()
router.route("/").post(registerUser).get(protect, allUser)
router.post("/login", authUser)
router.post("/google", googleAuth)
router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:token", resetPassword)
router.put("/profile", protect, updateProfile)
module.exports = router