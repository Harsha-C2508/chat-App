const asyncHandler = require("express-async-handler")


const accessChat = asyncHandler(async(req,res)=> {
    const { userId } = req.body();
    if (!userId) {
        return res.sendStatus(400);
    }
})

const fetchChat = asyncHandler(async(req,res)=> {
    
})


const createGroupChat = asyncHandler(async(req,res)=> {
    
})


const removeGroup = asyncHandler(async(req,res)=> {
    
})


const removeFromGroup = asyncHandler(async(req,res)=> {
    
})


const addToGroup = asyncHandler(async(req,res)=> {
    
})

module.exports = {
    createGroupChat,
    fetchChat,
    accessChat,
    removeFromGroup,
    removeGroup,
    addToGroup
}
