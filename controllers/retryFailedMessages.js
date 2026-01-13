const MessageLog = require("../models/MessageLog");
const { bot } = require("../bot/telegramBot");
const User = require("../models/User");
const Question = require("../models/Question");
const getQuestionFromR1 = require("../utils/getQuestion");
const logger = require("../utils/logger");

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
    if (!user || !user.chatId || !user.active) continue;

    let q = log.questionId ? await Question.findById(log.questionId).lean() : null;
    let messageText = log.text;

    // Fetch new question if missing or if log.text is null
    if ((!q || !messageText) && Array.isArray(user.subjects) && user.subjects.length) {
      const randomSubject = user.subjects[Math.floor(Math.random() * user.subjects.length)];
      try {
        const fetched = await getQuestionFromR1(randomSubject);
        if (fetched) {
          const saved = await Question.create(fetched);
          q = saved;

          messageText = `*${q.question}*\n\n${q.answer}

-------------------------

*Subject:* ${q.subject}  
*Difficulty:* ${q.difficulty || "Unknown"}  
*Source:* ${q.source || "Unknown"}
`;
          log.questionId = saved._id;
          log.text = messageText;
        }
      } catch (err) {
        logger.warn(`⚠️ Failed to fetch question from R1 for user ${user._id}: ${err.message}`);
        log.error = `Fetch failed: ${err.message}`;
        log.retryCount += 1;
        log.lastTriedAt = new Date();
        log.success = false;
        await log.save();
        continue;
      }
    }

    if (!q || !messageText) {
      log.error = "No valid question found";
      log.retryCount += 1;
      log.lastTriedAt = new Date();
      log.success = false;
      await log.save();
      continue;
    }

    // Check message length (Telegram limit is 4096 characters)
    if (messageText.length > 4096) {
      messageText = messageText.substring(0, 4090) + "...";
    }

    const baseOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Mark as Seen", callback_data: `seen_${user._id}` },
            { text: "Report", callback_data: `report_${q._id}` },
          ],
        ],
      },
    };

    let sent = false;
    try {
      await bot.sendMessage(user.chatId, messageText, {
        ...baseOptions,
        parse_mode: "Markdown",
      });
      sent = true;
    } catch (err) {
      if (err.message.includes("can't parse entities")) {
        try {
          await bot.sendMessage(user.chatId, messageText, baseOptions);
          sent = true;
        } catch (fallbackErr) {
          log.error = fallbackErr.message;
        }
      } else {
        log.error = err.message;
      }
    }

    log.retryCount += 1;
    log.lastTriedAt = new Date();
    log.success = sent;
    log.text = messageText;

    if (sent) {
      log.sentAt = new Date();
    }

    await log.save();
  }

  logger.info(`🔁 Retried ${failedLogs.length} failed messages`);
};

module.exports = retryFailedMessages;
