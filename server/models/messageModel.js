const mongoose = require("mongoose");
const messageModel = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content: {
        type: String,
        trim: true,
        default: "",
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Chat'
    },
    fileUrl: {
        type: String,
        default: null,
    },
    fileName: {
        type: String,
        default: null,
    },
    fileType: {
        type: String,
        default: null,
    },
    fileSize: {
        type: Number,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deliveredTo: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
    }],
    readBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
    }],
}, {
     timestamps:true,
})

const Message = mongoose.model("Message", messageModel);
module.exports = Message