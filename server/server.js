const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const ConnectDB = require("./Config/db");
const userRoutes = require("./Routes/userRoutes");
const { notFound, errorHandler } = require("./Middlewares/errorMiddleware");
const chatRoutes = require("./Routes/chatRoutes")
const messageRoutes = require("./Routes/messageRoutes")
const uploadRoutes = require("./Routes/uploadRoutes")
const fs = require("fs");
const { detectMimeFromFile } = require("./utils/fileMime");

ConnectDB()
const app = express();
app.set("io", null);

// Increase JSON body limit to support base64 file uploads (up to ~34MB for 25MB files)
app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ limit: "35mb", extended: true }));

const uploadsDir = path.join(__dirname, "uploads");

// Serve uploads with detected MIME (fixes videos saved with wrong extension e.g. .jpg)
app.get("/uploads/:filename", (req, res, next) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return next();
  }

  const detected = detectMimeFromFile(filePath);
  if (detected) {
    res.type(detected);
  }

  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:3000");

  if (req.query.download === "1") {
    const downloadName = path.basename(req.query.name || filename);
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName.replace(/"/g, "")}"`);
  }

  res.sendFile(filePath);
});

app.use("/uploads", express.static(uploadsDir));

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes );
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);

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
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`server started at ${PORT}`);
});

const clientOrigin = process.env.CLIENT_URL || "http://localhost:3000";
const io = require('socket.io')(server,{
    pingTimeout: 60000,
    cors :{
        origin : clientOrigin,
    }
})

app.set("io", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log(`connected to socket.io`);
    let currentUserId = null;

    socket.on("setup",(userData) => {
        currentUserId = String(userData._id);
        socket.join(currentUserId);

        if (!onlineUsers.has(currentUserId)) {
            onlineUsers.set(currentUserId, new Set());
        }
        onlineUsers.get(currentUserId).add(socket.id);

        if (onlineUsers.get(currentUserId).size === 1) {
            socket.broadcast.emit("user online", currentUserId);
        }

        socket.emit("online users", Array.from(onlineUsers.keys()));
        socket.emit("connected");
    });

    socket.on("disconnect", () => {
        if (!currentUserId) return;

        const userSockets = onlineUsers.get(currentUserId);
        if (!userSockets) return;

        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
            onlineUsers.delete(currentUserId);
            socket.broadcast.emit("user offline", currentUserId);
        }
    });

    socket.on('join chat', (room) => {
        socket.join(room);
    });

    socket.on('typing', ({ room, userId })=>{
        socket.in(room).emit('typing', userId)
    });

    socket.on('stop typing', ({ room, userId })=>{
        socket.in(room).emit('stop typing', userId)
    });

    socket.on("new message", (newMessageRecieved) =>{
        var chat = newMessageRecieved.chat;
        if(!chat || !chat.users || chat.users.length === 0) {
            console.log("chat.users not defined on message:", JSON.stringify(newMessageRecieved?.chat));
            return;
        }

        chat.users.forEach(user => {
            const userId = user._id || user;
            if(String(userId) == String(newMessageRecieved.sender._id)) return;

            socket.in(String(userId)).emit("message recieved", newMessageRecieved);
        });
    });

    socket.on("message deleted", (deletedMessage) => {
        var chat = deletedMessage.chat;
        if(!chat || !chat.users || chat.users.length === 0) return;

        chat.users.forEach(user => {
            const userId = user._id || user;
            if(String(userId) == String(deletedMessage.sender._id)) return;

            socket.in(String(userId)).emit("message deleted", deletedMessage);
        });
    });
    
});