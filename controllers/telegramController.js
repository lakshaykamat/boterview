const Question = require("../models/Question");
const User = require("../models/User");
const { bot } = require("../bot/telegramBot");

const MessageLog = require("../models/MessageLog");
const sendTelegramQuestion = async () => {
  const users = await User.find({ active: true, chatId: { $ne: null } });

  for (const user of users) {
    if (!user.subjects?.length) continue;

    let q = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      // 🎯 Step 1: Pick a random subject from the user's subjects
      const randomSubject =
        user.subjects[Math.floor(Math.random() * user.subjects.length)];

      // 🎯 Step 2: Pick a random question from that subject
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

    if (!q) continue; // couldn't get a new question

    // 📝 Format message
    const message = `*${q.question}*\n\n
${q.answer}

-------------------------

📚 *Subject:* ${q.subject}  
🧠 *Difficulty:* ${q.difficulty || "Unkown"}  
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
