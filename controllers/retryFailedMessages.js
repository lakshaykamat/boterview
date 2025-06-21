const MessageLog = require("../models/MessageLog");
const { bot } = require("../bot/telegramBot");

const retryFailedMessages = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  const failedLogs = await MessageLog.find({
    success: false,
    retryCount: { $lt: 10 },
    sentAt: { $gte: oneDayAgo },
    lastTriedAt: { $lt: oneHourAgo },
  });

  for (const log of failedLogs) {
    const newLog = {
      userId: log.userId,
      chatId: log.chatId,
      questionId: log.questionId || null,
      text: log.text,
      retryCount: (log.retryCount || 0) + 1,
      lastTriedAt: new Date(),
      sentAt: new Date(),
    };

    try {

      await bot.sendMessage(log.chatId, log.text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Mark as Seen", callback_data: `seen_${user._id}` }],
            { text: "Report", callback_data: `report_${q._id}` },
          ],
        },
      });
      newLog.success = true;
      newLog.error = null;
    } catch (err) {
      newLog.success = false;
      newLog.error = err.message;
    }

    await MessageLog.create(newLog);
  }

  console.log(`Retried ${failedLogs.length} failed messages`);
};

module.exports = retryFailedMessages;
