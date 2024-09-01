const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./Config/db");
const userRoutes = require("./Routes/userRoutes");
const { notFound, errorHandler } = require("./Middlewares/errorMiddleware");
const chatRoutes = require("./Routes/chatRoutes")
const messageRoutes = require("./Routes/messageRoutes")
const path = require("path");

dotenv.config()

ConnectDB()
const app = express(); 

app.use(express.json()) // to accept JSON data from frontend

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes );
app.use('/api/message', messageRoutes);

// ------------------------------------deployment------------------------------------------
const __dirname1 = path.resolve();
if(process.env.NODE_ENV==="production") { 
    app.use(express.static(path.join(__dirname1,"/client/build")));

    app.get("*", (req,res) =>
        res.sendFile(path.resolve(__dirname1,"client","build","index.html"))
    );
} else {
    app.get("/", (req, res) => {
        res.send("API of chit chat is running")
    });
}
// ------------------------------------------------------------------------------------
app.use( notFound );
app.use( errorHandler );

const PORT = process.env.PORT || 5000
const server = app.listen(PORT , console.log(`server started at ${PORT}`));

const io = require('socket.io')(server,{
    pingTimeout: 60000,
    cors :{
        origin : "http://localhost:3000", 
    }
})

io.on("connection", (socket) => {
    console.log(`connected to socket.io`);

    socket.on("setup",(userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat', (room) => {
        socket.join(room);
    });

    socket.on('typing', (room)=>{
        socket.in(room).emit('typing')
    });

    socket.on('stop typing', (room)=>{
        socket.in(room).emit('stop typing')
    });

    socket.on("new message", (newMessageRecieved) =>{
        var chat = newMessageRecieved.chat;
        if(!chat.users) return console.log("chat.user not defined");

        chat.users.forEach(user => {
            if(user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });
    
});