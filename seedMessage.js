const mongoose = require("mongoose");
const Message = require("./models/Message");
const Group = require("./models/Group");

const MONGO_URI = "mongodb+srv://dedeepya:srilatha5@cluster0.zwlk1.mongodb.net/chatdb"; // change this

const createSampleMessage = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📦 Connected to MongoDB");

    const groupId = "665c8e86b129f0a6f3a7b101"; // College Buddies
    const senderId = "665c8e60b129f0a6f3a7b001"; // Dedeepya

    const message = await Message.create({
      content: "Hey everyone! Welcome to the group.",
      sender: senderId,
      group: groupId,
    });

    await Group.findByIdAndUpdate(groupId, {
      $push: { messages: message._id },
    });

    console.log("✅ Message added and linked to group");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.connection.close();
  }
};

createSampleMessage();
