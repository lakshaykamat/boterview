const Question = require("../models/Question");
const User = require("../models/User");
const { bot } = require("../bot/telegramBot");
const MessageLog = require("../models/MessageLog");
const getQuestionFromR1 = require("../utils/getQuestion");
const logger = require("../utils/logger");

const sendTelegramQuestion = async () => {
  const users = await User.find({ active: true, chatId: { $ne: null } });

  for (const user of users) {
    if (!Array.isArray(user.subjects) || user.subjects.length === 0) continue;

    let q = null;
    let subjectTried = null;

    // Attempt to fetch question
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        subjectTried =
          user.subjects[Math.floor(Math.random() * user.subjects.length)];

        logger.debug(`Fetching question for subject: ${subjectTried} (user: ${user._id})`);
        const result = await getQuestionFromR1(subjectTried);

        if (!result || typeof result !== "object") continue;

        q = result;
        break; // Valid question found
      } catch (err) {
        logger.warn(
          `⚠️ Attempt ${attempt + 1} failed for user ${user._id}: ${err.message}`
        );
        continue;
      }
    }

    // ❌ Failed to get a question even after retries — log it
    if (!q) {
      await MessageLog.create({
        userId: user._id,
        chatId: user.chatId,
        questionId: null,
        text: null,
        subject: subjectTried || null,
        success: false,
        error: "Failed to fetch question from R1",
        retryCount: 1,
        lastTriedAt: new Date(),
        sentAt: new Date(),
      });
      continue;
    }

    // ✅ Save question to DB
    let savedQues;
    try {
      savedQues = await Question.create({
        number: q.number,
        question: q.question,
        answer: q.answer,
        subject: q.subject,
        difficulty: q.difficulty,
        source: q.source,
      });
    } catch (err) {
      logger.error(
        `❌ Failed to save question for user ${user._id}: ${err.message}`
      );

      await MessageLog.create({
        userId: user._id,
        chatId: user.chatId,
        questionId: null,
        text: null,
        subject: q.subject,
        success: false,
        error: "DB insert failed: " + err.message,
        retryCount: 1,
        lastTriedAt: new Date(),
        sentAt: new Date(),
      });

      continue;
    }

    let message = `*${q.question}*\n\n${q.answer}

-------------------------

*Subject:* ${q.subject}  
*Difficulty:* ${q.difficulty || "Unknown"}  
*Source:* ${q.source || "Unknown"}
`;

    // Check message length (Telegram limit is 4096 characters)
    if (message.length > 4096) {
      message = message.substring(0, 4090) + "...";
    }

    try {
      await bot.sendMessage(user.chatId, message, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Mark as Seen", callback_data: `seen_${user._id}` },
              { text: "Report", callback_data: `report_${savedQues._id}` },
            ],
          ],
        },
      });

      // ✅ Successful send
      await MessageLog.create({
        userId: user._id,
        chatId: user.chatId,
        questionId: savedQues._id,
        subject: q.subject,
        text: message,
        success: true,
        retryCount: 0,
        lastTriedAt: new Date(),
        sentAt: new Date(),
      });

      await User.updateOne(
        { _id: user._id },
        {
          lastSent: new Date(),
          lastQuestionId: savedQues._id,
        }
      );
    } catch (err) {
      logger.error(
        `❌ Failed to send message to user ${user._id}: ${err.message}`
      );

      await MessageLog.create({
        userId: user._id,
        chatId: user.chatId,
        questionId: savedQues._id,
        subject: q.subject,
        text: message,
        success: false,
        error: err.message,
        retryCount: 1,
        lastTriedAt: new Date(),
        sentAt: new Date(),
      });
    }
  }
};

module.exports = sendTelegramQuestion;
