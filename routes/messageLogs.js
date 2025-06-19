const express = require("express");
const router = express.Router();
const MessageLog = require("../models/MessageLog");
// const User = require("../models/User");
// const Question = require("../models/Question");

router.get("/bot", async (req, res) => {
  try {
    const logs = await MessageLog.find()
      .populate("userId", "email")
      .populate("questionId", "subject number")
      .sort({ sentAt: -1 })
      .limit(100);

    let output = "📬 Message Delivery Logs (Latest 100)\n";
    output += "----------------------------------------\n\n";

    logs.forEach((log, index) => {
      const time = log.sentAt.toISOString().replace("T", " ").slice(0, 19);
      const status = log.success ? "✅" : "❌";
      const user = log.userId?.email || `Chat ID: ${log.chatId}`;
      const subject = log.questionId?.subject || "—";
      const questionNum = log.questionId?.number || "—";

      output += `${index + 1}. ${status} ${time}\n`;
      output += `👤 ${user}\n`;
      output += `📚 Subject: ${subject} | #${questionNum}\n`;
      if (!log.success) output += `⚠️ Error: ${log.error}\n`;
      output += "\n";
    });

    res.type("text").send(output);
  } catch (error) {
    console.error("Failed to load message logs:", error.message);
    res.status(500).send("❌ Failed to load logs");
  }
});

module.exports = router;
