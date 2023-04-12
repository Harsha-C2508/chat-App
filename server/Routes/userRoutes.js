const express = require("express");
const { registerUser, authUser, allUser } = require("../Controller/userController");

const router = express.Router()
router.route("/").post(registerUser)
router.post("/login",authUser)
router.get("/",allUser)
module.exports = router