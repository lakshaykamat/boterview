const MessageLog = require("../../models/MessageLog");
const Question = require("../../models/Question");

function handleHistory(bot) {
  bot.onText(/\/history/, async (msg) => {
    const chatId = msg.chat.id;

    const logs = await MessageLog.find({
      chatId,
      success: true,
      questionId: { $ne: null }
    })
      .sort({ sentAt: -1 })
      .limit(15)
      .lean();

    if (logs.length === 0) {
      return bot.sendMessage(chatId, "❌ No recent questions found.");
    }

    for (const log of logs) {
      const q = await Question.findById(log.questionId).lean();
      if (!q) continue;

      const message = `*${q.question}*\n\n${q.answer}

-------------------------

📚 *Subject:* ${q.subject}
🧠 *Difficulty:* ${q.difficulty || "N/A"}
📌 *Source:* ${q.source || "N/A"}
`;

      try {
        await bot.sendMessage(
          chatId,
          message,
          { parse_mode: "Markdown" },
          {
            reply_markup: {
              inline_keyboard: [
                { text: "Report", callback_data: `report_${q._id}` },
              ],
            },
          }
        );
      } catch (err) {
        // If Markdown fails (e.g., due to bad formatting), resend as plain text
        await bot.sendMessage(chatId, message, {
          reply_markup: {
            inline_keyboard: [
              { text: "Report", callback_data: `report_${q._id}` },
            ],
          },
        }); // no parse_mode
      }
    }
  });
}

module.exports = handleHistory;
