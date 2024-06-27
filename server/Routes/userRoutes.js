const express = require("express");
const { registerUser, authUser, allUser } = require("../Controller/userController");
const { protect } = require("../Middlewares/authMiddleware");

const router = express.Router()
router.route("/").post(registerUser).get(protect, allUser)
router.post("/login",authUser)
module.exports = router