const { bot } = require("../bot/telegramBot");
const Question = require("../models/Question");

// Replace with your own Telegram chat ID or set via ENV
const TEST_CHAT_ID = process.env.ADMIN_CHATID || "YOUR_TELEGRAM_CHAT_ID";

const sendTestQuestionToAdmin = async () => {
  try {
    const question = await Question.aggregate([{ $sample: { size: 1 } }]);
    if (!question.length) {
      console.warn("⚠️ No questions found in the database.");
      return;
    }

    const q = question[0];

    const message =
      `*${q.question}*\n\n` +
      `${q.answer}\n\n` +
      `-------------------------\n\n` +
      `📚 *Subject:* ${q.subject || "Unknown"}\n` +
      `🧠 *Difficulty:* ${q.difficulty || "Unknown"}\n` +
      `📌 *Source:* ${q.source || "Unknown"}`;

    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "✅ Mark as Seen", callback_data: `seen_fakeUser` }],
        [{ text: "📩 Report", callback_data: `report_${q._id}` }]
      ]
    };

    try {
      // Attempt to send with Markdown formatting
      await bot.sendMessage(TEST_CHAT_ID, message, {
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard,
      });
    } catch (err) {
      console.warn("⚠️ Markdown failed. Retrying without parse_mode...");
      // Retry without Markdown if parsing fails
      await bot.sendMessage(TEST_CHAT_ID, message, {
        reply_markup: inlineKeyboard,
      });
    }

    console.log("✅ Random question sent to admin for testing.");
  } catch (err) {
    console.error("❌ Failed to send test question:", err.message);
  }
};

module.exports = sendTestQuestionToAdmin;
