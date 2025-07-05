const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
};

exports.postMessage = async (req, res) => {
  const newMessage = new Message(req.body);
  await newMessage.save();
  res.status(201).json(newMessage);
};
