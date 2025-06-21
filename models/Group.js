const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User", // referencing users
    },
  ],
  messages: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Message", // referencing messages (to be created)
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
