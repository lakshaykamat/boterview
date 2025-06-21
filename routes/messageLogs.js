const express = require("express");
const router = express.Router();
const MessageLog = require("../models/MessageLog");

// GET /bot — Show last 10 message logs
router.get("/bot", async (req, res) => {
  try {
    const logs = await MessageLog.find()
      .populate("userId", "email")
      .populate("questionId", "subject") // Populate just subject
      .sort({ sentAt: -1 })
      .limit(50);

    let output = `Message Delivery Logs (Latest 10 Entries)\n`;
    output += `==================================================\n\n`;

    logs.forEach((log, index) => {
      const istDate = new Date(log.sentAt.getTime() + 5.5 * 60 * 60 * 1000);
      const timestamp = istDate.toISOString().replace("T", " ").slice(0, 19).replace(/-/g, "/");

      const isBroadcast = !log.questionId;
      const user = log.userId?.email || `Chat ID: ${log.chatId}`;
      const subject = log.questionId?.subject || "N/A";
      const questionId = log.questionId?._id?.toString() || "N/A";
      const status = log.success ? "Success" : "Failed";

      output += `#${index + 1} ${isBroadcast ? "[📢 Broadcast]" : ""}\n`;
      output += `- Time        : ${timestamp} IST\n`;
      output += `- Status      : ${status}\n`;
      output += `- Recipient   : ${user}\n`;

      if (!isBroadcast) {
        output += `- Subject     : ${subject}\n`;
        output += `- Question ID : ${questionId}\n`;
      }

      output += `- Message     :\n${log.text}\n`;

      if (!log.success) {
        output += `- Error       : ${log.error}\n`;
      }

      output += `--------------------------------------------------\n\n`;
    });

    res.type("text").send(output);
  } catch (error) {
    console.error("❌ Failed to load message logs:", error.message);
    res.status(500).send("Failed to load logs.");
  }
});

module.exports = router;
