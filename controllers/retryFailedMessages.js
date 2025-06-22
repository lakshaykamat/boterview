const MessageLog = require("../models/MessageLog");
const { bot } = require("../bot/telegramBot");
const User = require("../models/User");
const Question = require("../models/Question");

const retryFailedMessages = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const failedLogs = await MessageLog.find({
    success: false,
    retryCount: { $lt: 10 },
    sentAt: { $gte: oneDayAgo },
    lastTriedAt: { $lt: oneHourAgo },
  });

  for (const log of failedLogs) {
    const user = await User.findById(log.userId).lean();
    const q = log.questionId ? await Question.findById(log.questionId).lean() : null;

    const baseOptions = {};
    if (user && q) {
      baseOptions.reply_markup = {
        inline_keyboard: [
          [
            { text: "Mark as Seen", callback_data: `seen_${user._id}` },
            { text: "Report", callback_data: `report_${q._id}` },
          ],
        ],
      };
    }

    let sent = false;
    try {
      await bot.sendMessage(log.chatId, log.text, { ...baseOptions, parse_mode: "Markdown" });
      sent = true;
    } catch (err) {
      if (err.message.includes("can't parse entities")) {
        try {
          await bot.sendMessage(log.chatId, log.text, baseOptions);
          sent = true;
        } catch (fallbackErr) {
          log.error = fallbackErr.message;
        }
      } else {
        log.error = err.message;
      }
    }

    log.retryCount = (log.retryCount || 0) + 1;
    log.lastTriedAt = new Date();
    log.sentAt = new Date();
    log.success = sent;

    await log.save();
  }

  console.log(`🔁 Retried ${failedLogs.length} failed messages`);
};

module.exports = retryFailedMessages;
