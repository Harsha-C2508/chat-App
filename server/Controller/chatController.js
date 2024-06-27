const asyncHandler = require("express-async-handler")
const Chat = require("../models/chatModel")
const User = require("../models/userModel")

const accessChat = asyncHandler(async(req,res)=> {
    const { userId } = req.body;
    if (!userId) {
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users:{$elemMatch:{eq:req.user._id}}},
            {users:{$elemMatch:{eq: userId}}},

        ]
    })
    .populate("users","-password")
        .populate("latestMessage");
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })

    if(isChat.length>0){
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users : [req.user._id, userId]
        }

        try{
            const createChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({_id: createChat._id}).populate(
                "users",
                "-password"
            );

            res.status(200).send(fullChat)
        } catch (err){
            res.status(400);
            throw new Error(err.message);
        }
    }
});

const fetchChat = asyncHandler(async(req,res)=> {
    // fetching the chat of a perticular user with which he is accosiated with
    try{
        Chat.find({users: {$eq: req.user._id}})
            .populate("users","-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
               .sort({updatedAt: -1})
            .then(async (results) =>{
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email"
                });
                 res.status(200).send(results);
            });
    } catch (error){
        res.status(400);
        throw new Error(err.message);
    }
});


const createGroupChat = asyncHandler(async(req,res)=> {
    let reqBody = req.body;
    if(!reqBody.users||!reqBody.name){
        return res.status(400).send({message:"Please fill all the fields"})
    }

    var users = JSON.parse(reqBody.users);
    if(users?.length<2){
      return res.status(400).send("More than 2 users are required for a group chat") 
    }
    users.push(req.user)

    try {
        const createGroup = await Chat.create({
            chatName: reqBody.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        })

        const getGroupChat = await Chat.findOne({_id: createGroup._id})
        .populate("users","-password")
        .populate("groupAdmin", "-password")

        res.status(200).json(getGroupChat)
    } catch (error) {
        res.status(400);
        throw new Error(err.message);
    }
})


const renameGroup = asyncHandler(async(req,res)=> {
    try {
        const {chatId, groupName} = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: groupName,
            },
            {
                new: true,
            }
        ).populate("users", "-password").populate("groupAdmin", "-password")
        
        if(!updatedChat) {
            res.status(404)
            throw new Error("Chat Not Found");
        } else {
            res.json(updatedChat);
        }
    } catch (error) {
        res.status(400);
        throw new Error(err.message);
    }
})


const removeFromGroup = asyncHandler(async(req,res)=> {
    try {
        const {chatId, userId} = req.body;

        const removeFromGroup = await Chat.findByIdAndUpdate(
            chatId,{
                $pull: {users: userId},
            },{
                new: true,
            }
        ).populate("users", "-password").populate("groupAdmin", "-password")

        if(!removeFromGroup){
            res.status(404);
            throw new Error("Chat Not Found")
        } else {
            res.json(removeFromGroup)
        }
    } catch (error) {
        res.status(400);
        throw new Error(err.message);
    }
})


const addToGroup = asyncHandler(async(req,res)=> {
    try {
        const {chatId, userId} = req.body;

        const addToGroup = await Chat.findByIdAndUpdate(
            chatId,{
                $push: {users: userId},
            },{
                new: true,
            }
        ).populate("users", "-password").populate("groupAdmin", "-password")

        if(!addToGroup){
            res.status(404);
            throw new Error("Chat Not Found")
        } else {
            res.json(addToGroup)
        }
    } catch (error) {
        res.status(400);
        throw new Error(err.message);
    }
})

module.exports = {
    createGroupChat,
    fetchChat,
    accessChat,
    removeFromGroup,
    renameGroup,
    addToGroup
}
