const User = require("../../models/User");

const userSubjectUpdates = new Map(); // chatId => string[]
const pendingSubjectInput = new Set();

function handleSettings(bot) {
  // /subjects — Let user input custom subjects manually
  bot.onText(/\/subjects/, async (msg) => {
    const chatId = msg.chat.id;

    const user = await User.findOne({ chatId });
    if (!user) {
      return bot.sendMessage(chatId, "❌ You're not subscribed. Use /start first.");
    }

    pendingSubjectInput.add(chatId);
    bot.sendMessage(
      chatId,
      "✍️ Please type your desired subjects, separated by commas (e.g., Python, System Design, APIs):",
      { reply_markup: { force_reply: true } }
    );
  });

  // Handle subject entry
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (pendingSubjectInput.has(chatId)) {
      pendingSubjectInput.delete(chatId);

      const subjects = text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (subjects.length === 0) {
        return bot.sendMessage(chatId, "❌ No valid subjects found. Please try again using /subjects.");
      }

      await User.updateOne({ chatId }, { subjects });
      userSubjectUpdates.delete(chatId);

      await bot.sendMessage(
        chatId,
        `✅ Subjects updated to:\n*${subjects.join(", ")}*`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // /status — Show user settings
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ chatId });

    if (!user) {
      return bot.sendMessage(chatId, "❌ You're not subscribed yet.");
    }

    const statusMsg = `🧾 *Your Subscription Info:*

*Email:* ${user.email || "_Not set_"}
*Subjects:* ${user.subjects.join(", ") || "_None_"}
*Active:* ${user.active ? "Yes" : "No"}
*Last Question:* ${user.lastSent ? new Date(user.lastSent).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Never"}`;

    bot.sendMessage(chatId, statusMsg, { parse_mode: "Markdown" });
  });
}

module.exports = handleSettings;
