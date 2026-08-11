const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const userModel = mongoose.Schema({
    name: { type: String,required:true},
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function () { return !this.googleId; },
    },
    googleId: { type: String, sparse: true, unique: true },
    pic: {
        type: String, default:
            "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
    bio: { type: String, default: "" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // isAdmin: {
    //   type: Boolean,
    //   // required: true,
    //   default: false,
    // },
},
    { timestamps: true, }
);

userModel.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

userModel.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        next()
        return
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
})

const User = mongoose.model("User", userModel);
module.exports = User