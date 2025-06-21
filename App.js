const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const groupRoutes = require("./routes/groupRoutes");
const Message = require("./models/Message");
const Group = require("./models/Group");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL if needed
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/groups", groupRoutes);

// MongoDB connection
mongoose
  .connect("mongodb+srv://dedeepya:srilatha5@cluster0.zwlk1.mongodb.net/chatdb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Socket.IO logic ---
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Join a group room
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log(`📥 Socket ${socket.id} joined group ${groupId}`);
  });

  // Receive and broadcast message
  socket.on("send-message", async ({ groupId, senderId, content }) => {
    try {
      // 1. Save message
      const newMessage = await Message.create({
        sender: senderId,
        group: groupId,
        content,
        sentAt: new Date(),
      });
      console.log(newMessage);

      // 2. Add message to group
      await Group.findByIdAndUpdate(groupId, {
        $push: { messages: newMessage._id },
      });

      // 3. Populate sender info for frontend display
      const fullMessage = await newMessage.populate("sender", "firstName lastName avatar");

      // 4. Emit to all clients in the group
      io.to(groupId).emit("receive-message", fullMessage);

      console.log(`✅ Message sent to group ${groupId}`);
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
server.listen(9000, () => {
  console.log("🚀 Server running on http://localhost:9000");
});
