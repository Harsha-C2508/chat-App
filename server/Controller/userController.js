const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");
const tokenCreate = require("../Config/tokenCreate");
const { saveUploadedFile } = require("../utils/saveUploadedFile");
const { sendEmail } = require("../utils/sendEmail");
const { normalizeEmail, findUserByEmail } = require("../utils/emailUtils");

const getGoogleOAuth = () => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";
    const googleClient = new OAuth2Client(
        googleClientId,
        googleClientSecret,
        "postmessage"
    );
    return { googleClientId, googleClientSecret, googleClient };
};


// part for registration 
const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password, pic, picBase64, picFileName } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("please enter all the feilds")
    }

    const normalizedEmail = normalizeEmail(email);
    const userIn = await findUserByEmail(User, email);
    if (userIn) {
        res.status(409).json({ message: `An account with the email "${normalizedEmail}" already exists. Please login or use a different email.` });
        return;
    }

    let picUrl = pic;
    if (picBase64) {
        try {
            picUrl = saveUploadedFile(picBase64, picFileName || "avatar.jpg", 5 * 1024 * 1024);
        } catch (err) {
            res.status(400);
            throw new Error(err.message || "Could not save profile picture");
        }
    }

    const newUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        pic: picUrl
    });
    if (newUser) {
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            pic: newUser.pic,
            bio: newUser.bio,
            token: tokenCreate(newUser._id)
        })
    }
    else {
        res.status(400);
        throw new Error("Failed to create the user")
    }
})
 
// login part
const authUser = asyncHandler(async(req,res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please enter both email and password");
    }

    const userIn = await findUserByEmail(User, email);

    if (!userIn) {
        res.status(404);
        throw new Error("No user found with this email. Please sign up first.");
    }

    if (!(await userIn.matchPassword(password))) {
        res.status(401);
        throw new Error("Incorrect password. Please try again.");
    }

    res.json({
        _id: userIn._id,
        name: userIn.name,
        email: userIn.email,
        pic: userIn.pic,
        bio: userIn.bio,
        token: tokenCreate(userIn._id),
    });
})



// update profile ROUTE = PUT /api/user/profile
const updateProfile = asyncHandler(async (req, res) => {
    const { name, pic, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error("User not found"); }

    if (name !== undefined) user.name = name;
    if (pic !== undefined) user.pic = pic;
    if (bio !== undefined) user.bio = bio;

    const updated = await user.save();
    res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        pic: updated.pic,
        bio: updated.bio,
        token: tokenCreate(updated._id),
    });
});

// to get all user ROUTE = /api/user?search=harsha(name or search value)
const allUser = asyncHandler(async(req,res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } }
            
        ],
    }
    : {};  
    
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)
})
// Google OAuth login/signup ROUTE = POST /api/user/google
const googleAuth = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400);
        throw new Error("Google authorization code is required");
    }

    const { googleClientId, googleClientSecret, googleClient } = getGoogleOAuth();

    if (!googleClientId || !googleClientSecret) {
        res.status(503);
        throw new Error("Google login is not configured on the server");
    }

    const { tokens } = await googleClient.getToken({
        code,
        redirect_uri: "postmessage",
    });
    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: googleClientId,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    if (!email) {
        res.status(400);
        throw new Error("Google account did not return an email address");
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
        if (!user.googleId) {
            user.googleId = googleId;
            if (picture && user.pic.includes("gravatar")) user.pic = picture;
            await user.save();
        }
    } else {
        user = await User.create({
            name: name || email.split("@")[0],
            email,
            googleId,
            pic: picture,
            password: crypto.randomBytes(32).toString("hex"),
        });
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        bio: user.bio,
        token: tokenCreate(user._id),
    });
});

const getResetUrl = (token) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    return `${clientUrl}/reset-password/${token}`;
};

// Forgot password ROUTE = POST /api/user/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error("Please enter your email address");
    }

    const user = await findUserByEmail(User, email);
    const genericMessage =
        "If an account exists with that email, a password reset link has been sent.";

    if (!user) {
        res.json({ message: genericMessage });
        return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = getResetUrl(resetToken);
    const recipientEmail = user.email;
    const emailResult = await sendEmail({
        to: recipientEmail,
        subject: "Halo — Reset your password",
        text: `Hi ${user.name},\n\nReset your password using this link (valid for 10 minutes):\n\n${resetUrl}`,
        html: `<p>Hi ${user.name},</p><p>Reset your password using this link (valid for 10 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    if (emailResult.sent) {
        if (process.env.NODE_ENV !== "production") {
            console.log(`[Halo] Password reset email sent to: ${recipientEmail}`);
        }
        res.json({ message: genericMessage });
        return;
    }

    if (process.env.NODE_ENV !== "production") {
        console.error(`[Halo] Failed to send reset email to ${recipientEmail}:`, emailResult.reason);
        console.log("[Halo] Password reset link (fallback):");
        console.log(resetUrl);
        console.log("");
        res.json({ message: genericMessage });
        return;
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Failed to send reset email. Please try again later.");
});

// Reset password ROUTE = PUT /api/user/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
        res.status(400);
        throw new Error("Please enter a new password");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error("Invalid or expired reset link. Please request a new one.");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now sign in." });
});

module.exports = { registerUser, authUser, allUser, updateProfile, googleAuth, forgotPassword, resetPassword }