const Group = require("../models/Group");
const Message = require("../models/Message");

exports.getAllGroups = async (req, res) => {
  const groups = await Group.find()
    .populate("members", "firstName lastName avatar")
    .populate({ path: "messages", options: { sort: { sentAt: -1 }, limit: 5 },
      populate: { path: "sender", select: "firstName avatar" } });

  res.json(groups.map(g => ({
    ...g.toObject(),
    messages: g.messages.reverse(),
  })));
};

exports.createGroup = async (req, res) => {
  const g = new Group({ name: req.body.name, members: req.body.members || [] });
  const saved = await g.save();
  res.status(201).json(saved);
};
