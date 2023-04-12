const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const tokenCreate = require("../Config/tokenCreate");


// part for registration 
const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password, pic } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("please enter all the feilds")
    }

    const userIn = await User.findOne({ email });
    if (userIn) {
        res.status(400);
        throw new Error("User already exists")
    }
    const newUser = await User.create({
        name,
        email,
        password,
        pic
    });
    if (newUser) {
        res.status(201).json({
            _id: newUser._id,
            name:newUser.name,
            email:newUser.email,
            pic: newUser.pic,
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

    const userIn = await User.findOne({ email });

    if (userIn && (await userIn.matchPassword(password))) {
         res.json({
            _id: userIn._id,
            name: userIn.name,
            email:userIn.email,
            pic: userIn.pic,
            token: tokenCreate(userIn._id)
        })
    }
    else {
        res.status(401);
        throw new Error("Invalid Email or password")
    }
})



// to get all user
const allUser = asyncHandler(async(req,res) => {
     
})
module.exports = {registerUser,authUser,allUser}