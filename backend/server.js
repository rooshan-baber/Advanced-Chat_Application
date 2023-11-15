const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const routes = require("./api/routes");
const connectDB = require("./database/config");
const colors = require("colors");
const PORT = 4000;
const app = express();
dotenv.config();
connectDB();

// Allow requests from frontend's domain
const corsOptions = {
  origin: "*", // Replace with your frontend domain
  methods: ["GET", "POST"], // Allow GET and POST methods
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);

const io = new Server({
  cors: {
    origin: "*"
  },
});

let onlineUsers = [];
io.on("connection", (socket) => {
  console.log("A connection is made");
  const updateOnlineUsers = async () => {
    io.emit("getOnlineUsers", onlineUsers);
  };

  // listen to a connection
  socket.on("addNewUser", async (userId) => {
    const existingUser = onlineUsers.find((user) => user.userId === userId);
    
    if (existingUser) {
      // If the user already exists in the onlineUsers array, update the socket ID
      existingUser.socketId = socket.id;
    } else {
      // If the user is not in the array, add them with the new socket ID
      onlineUsers.push({ userId, socketId: socket.id });
    }
    console.log("onlineUsers: ", onlineUsers);
    await updateOnlineUsers();
  });

  socket.on("privateMessage", (message, recipientId) => {
    const user = onlineUsers.find((user) => user.userId === recipientId);
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification",{
        senderId: message.senderId,
        senderName: message.senderName,
        isRead: false,
        date:new Date(),
      });
    }
  });

  // Handle disconnection
  socket.on("dis", () => {
    console.log("A user disconnected: ", socket.id);
    // Remove the user from the onlineUsers array when they disconnect
    const index = onlineUsers.findIndex((user) => user.socketId === socket.id);
    if (index !== -1) {
      onlineUsers.splice(index, 1);
    }
    io.emit("getOnlineUsers",onlineUsers);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`.yellow.bold);
});

io.listen(5000);
