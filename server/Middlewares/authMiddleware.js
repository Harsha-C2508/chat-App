const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js")
const asyncHandler = require("express-async-handler");


const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                res.status(401);
                throw new Error("Not authorized, user no longer exists");
            }
            req.user = user;
            next();
        } catch (err) {
            console.error("Auth error:", err.message);
            res.status(401);
            throw new Error(err.message || "Not authorized");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

module.exports = {protect}