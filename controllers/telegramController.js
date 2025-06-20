const Question = require("../models/Question");
const User = require("../models/User");
const { bot } = require("../bot/telegramBot");
const MessageLog = require("../models/MessageLog");

const sendTelegramQuestion = async () => {
  const users = await User.find({ active: true, chatId: { $ne: null } });

  for (const user of users) {
    if (!user.subjects?.length) continue;

    let q = null;

    // 🎯 Try up to 3 times to find a new question
    for (let attempt = 0; attempt < 3; attempt++) {
      const randomSubject =
        user.subjects[Math.floor(Math.random() * user.subjects.length)];

      const result = await Question.aggregate([
        { $match: { subject: randomSubject } },
        { $sample: { size: 1 } },
      ]);

      if (!result.length) continue;

      const candidate = result[0];
      if (
        !user.lastQuestionId ||
        candidate._id.toString() !== user.lastQuestionId?.toString()
      ) {
        q = candidate;
        break;
      }
    }

    if (!q) {
      // Optional: log "no new question found" if needed
      continue;
    }

    // 📝 Format message
    const message = `*${q.question}*\n\n${q.answer}

-------------------------

📚 *Subject:* ${q.subject}  
🧠 *Difficulty:* ${q.difficulty || "Unknown"}  
📌 *Source:* ${q.source || "Unknown"}
`;

    try {
      await bot.sendMessage(user.chatId, message, { parse_mode: "Markdown" });

      await MessageLog.create({
        userId: user._id,
        chatId: user.chatId,
        questionId: q._id,
        text: message,
        success: true,
        retryCount: 0,
        lastTriedAt: new Date()
      });

      await User.updateOne(
        { _id: user._id },
        {
          lastSent: new Date(),
          lastQuestionId: q._id,
        }
      );
    } catch (err) {
      console.error(`❌ Failed to message user ${user._id}:`, err.message);

      await MessageLog.create({
        userId: user._id,
        chatId: user.chatId,
        questionId: q._id,
        text: message,
        success: false,
        error: err.message,
        retryCount: 1,
        lastTriedAt: new Date()
      });
    }
  }
};

module.exports = sendTelegramQuestion;
