const Question = require("../models/Question");
const User = require("../models/User");
const { bot } = require("../bot/telegramBot");
const dayjs = require("dayjs");
const MessageLog = require("../models/MessageLog");

const sendTelegramQuestion = async () => {
  // const today = dayjs().startOf("day");

  const users = await User.find({ active: true, chatId: { $ne: null } });

  for (const user of users) {
    if (!user.subjects?.length) continue;

    // Try up to 3 times to avoid sending the same question
    let q = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await Question.aggregate([
        { $match: { subject: { $in: user.subjects } } },
        { $sample: { size: 1 } },
      ]);

      if (!result.length) break;

      const candidate = result[0];
      if (
        !user.lastQuestionId ||
        candidate._id.toString() !== user.lastQuestionId?.toString()
      ) {
        q = candidate;
        break;
      }
    }

    if (!q) continue; // couldn't get a new question

    // Format message
    const message = `*💬 Interview Question:*  
*${q.question}*

-------------------------

*Answer:*  
${q.answer}

-------------------------

📚 *Subject:* ${q.subject}  
🧠 *Difficulty:* ${q.difficulty}  
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
      });
      // Update user
      await User.updateOne(
        { _id: user._id },
        {
          lastSent: new Date(),
          lastQuestionId: q._id,
        }
      );
    } catch (err) {
      console.error(`❌ Failed to message user ${user._id}:`, err.message);
    }
  }
};

module.exports = sendTelegramQuestion;
