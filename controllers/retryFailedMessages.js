const MessageLog = require("../models/MessageLog");
const { bot } = require("../bot/telegramBot");

const retryFailedMessages = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);   // 24 hours ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);       // 1 hour ago


  const failedLogs = await MessageLog.find({
    success: false,
    retryCount: { $lt: 10 },
    sentAt: { $gte: oneDayAgo },
    lastTriedAt: { $lt: oneHourAgo }
  });

  for (const log of failedLogs) {
    try {
      await bot.sendMessage(log.chatId, log.text); // No parse_mode for raw
      log.success = true;
      log.error = null;
    } catch (err) {
      log.retryCount = (log.retryCount || 0) + 1;
      log.error = err.message;
    }

    log.lastTriedAt = new Date();
    await log.save();
  }

  console.log(`Retried ${failedLogs.length} failed messages`);
};

module.exports = retryFailedMessages;
