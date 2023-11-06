const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../database/models/User");
const Chat = require("../database/models/Chat");
const Message = require("../database/models/Message");
const SK = "qwertyuiopasdfghjklzxcvbnmqwerty";
const app = express();

//MIDDLEWARES
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("Received token:", token);
      // Decodes token id
      const decoded = jwt.verify(token, SK);
      console.log(decoded);

      req.user = await User.findById(decoded.id).select("-password");

      next(); // Call next to continue the middleware chain
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

//ROUTES

// CREATE USER (SIGNUP)
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all Fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    const user = await User.create({
      username,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.username,
        email: user.email,
        token: jwt.sign({_id: user._id , email: user.email, username: user.username }, SK),
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//FIND USER (LOGIN)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && password == user.password) {
      res.status(200).json({
        _id: user._id,
        name: user.username,
        email: user.email,
        token: jwt.sign({ _id: user._id , email: user.email, username: user.username }, SK),
      });
    } else {
      console.log("Incorrect email or password");
      res.status(401).send("Incorrect email or password");
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error Finding User: ", error);
    res.status(500).json({ error: error.message });
    res.redirect("/login");
  }
});

//Find User By ID
app.get("/findUser/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
  res.status(200).send(user)
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Find All Users
app.get("/allUsers", async (req, res) => {
  try {
    const user = await User.find();
  res.status(200).send(user)
  } catch (error) {
    res.status(500).json({ error: error.message });    
  }
});

//Create New Chat
app.post('/newchat', async (req, res) => {
  try {
    const { members } = req.body;
    const firstId = members[0];
    const secondId = members[1];
    const chat = await Chat.findOne({
      members: { $all: [firstId, secondId] }
    });

    if (chat) return res.status(200).json(chat);

    const newchat = await Chat.create({
      members: [firstId, secondId]
    });

    res.status(200).json(newchat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Find Chat by ID
app.get('/finduserchat/:userId',async (req,res)=>{
  try {
    const userId = req.params.userId;
    const chat = await Chat.find({
      members: {$in: [userId]}
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Find Chat
app.get('/findchat/:firstId/:secondId',async (req,res)=>{
  try {
    const {firstId, secondId} = req.params;
    const chat = await Chat.find({
      members: {$all:[firstId, secondId]}
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Create Message
app.post('/newmsg',async (req,res)=>{
  try {
    const {chatId, senderId, text} = req.body;
    const newmsg = await Message.create({
      chatId, senderId, text
    });
    res.status(200).json(newmsg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get Message
app.get('/getmsg/:chatId', async (req,res)=>{
  try {
    const {chatId} = req.params;
    const msgs = await Message.find({chatId});
    res.status(200).json(msgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = app;
