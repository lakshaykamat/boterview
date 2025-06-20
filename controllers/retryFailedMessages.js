const MessageLog = require("../models/MessageLog");
const { bot } = require("../bot/telegramBot");

const retryFailedMessages = async () => {
  const failedLogs = await MessageLog.find({
    success: false,
    retryCount: { $lt: 3 },
    lastTriedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } // Retry every 5 min
  });

  for (const log of failedLogs) {
    try {
      await bot.sendMessage(log.chatId, log.text, { parse_mode: "Markdown" });

      log.success = true;
      log.error = null;
    } catch (err) {
      log.retryCount += 1;
      log.lastTriedAt = new Date();
      log.error = err.message;
    }

    await log.save();
  }

  console.log(`🔁 Retried ${failedLogs.length} failed messages`);
};

module.exports = retryFailedMessages;
