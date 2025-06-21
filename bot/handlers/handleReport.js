const User = require("../../models/User");
const Question = require("../../models/Question");

// Set your admin Telegram chatId
const ADMIN_CHAT_ID = process.env.ADMIN_CHATID || "123456789";

function handleReport(bot) {
  bot.on("callback_query", async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (!data.startsWith("report_")) return;

    const questionId = data.replace("report_", "");

    const question = await Question.findById(questionId).lean();
    const user = await User.findOne({ chatId });

    if (!question || !user) {
      bot.answerCallbackQuery(query.id, {
        text: "❌ Failed to report this question.",
        show_alert: true,
      });
      return;
    }

    // DM the admin
    const reportMsg = `*Reported Question*\n\n` +
      `From: ${user.email || "Unknown"} (ID: ${user._id})\n` +
      `Question ID: \`${question._id}\`\n` +
      `Subject: ${question.subject || "N/A"}\n` +
      `Difficulty: ${question.difficulty || "N/A"}\n\n` +
      `Question: \n${question.question}\n\n` +
      `Answer: \n${question.answer}`;

    try {
      await bot.sendMessage(ADMIN_CHAT_ID, reportMsg, { parse_mode: "Markdown" });
      bot.answerCallbackQuery(query.id, { text: "Reported to admin!" });
    } catch (err) {
      bot.answerCallbackQuery(query.id, {
        text: "Couldn't send report.",
        show_alert: true,
      });
    }
  });
}

module.exports = handleReport;
