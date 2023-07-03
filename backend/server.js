const express = require("express");
const { chats } = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = express();
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('../backend/routes/chatRoutes');
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const messageRoutes= require('./routes/messageRoutes');

const path = require('path');
dotenv.config();
connectDB();
app.use(express.json()); //to accept JSON data
app.get('/',(req, res) => {
    res.send("API is Running");
})

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

app.use(notFound);
app.use(errorHandler);

// deploy-----------------------------------------------------------
app.use(express.static(path.join(__dirname,"./frontend/build")));
app.get("*", function(req,res){
  res.sendFile(path.join(__dirname,"./frontend/build/index.html"));
})
//------------------------------------------------------------------

const PORT = process.env.PORT || 5000
const server = app.listen(PORT);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  // to avoid cross origin errors
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  
  // to join a room exclusive to that user
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // to create a room or join 
  socket.on("join chat", (room) => {
    socket.join(room);
    
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // for new messages
  socket.on("message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    
    if (!chat.users) return ;
    // to make sure sender does not receive the msg
    
    chat.users.forEach((user) => {
      if (user._id !== newMessageRecieved.sender._id)  
        {
          
          io.in(user._id).emit("message recieved", newMessageRecieved);
        }
      
    });
  });

  //remove a user from group
  socket.on("remove",(user)=>{
    io.in(user._id).emit("removed",user);
  })

  socket.off("setup", () => {
    
    socket.leave(userData._id);
  });
});
