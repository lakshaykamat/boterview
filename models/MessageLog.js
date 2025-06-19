// models/MessageLog.js
const mongoose = require("mongoose");

const MessageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatId: String,
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", default: null },
  text: String,
  sentAt: { type: Date, default: Date.now },
  success: { type: Boolean, default: true },
  error: { type: String, default: null }
});

module.exports = mongoose.model("MessageLog", MessageLogSchema);
