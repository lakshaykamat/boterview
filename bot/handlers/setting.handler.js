const User = require("../../models/User");
const Question = require("../../models/Question");

const userSubjectUpdates = new Map(); // chatId => true

const getAllSubjects = async () => {
  const subjects = await Question.distinct("subject");
  return subjects.sort();
};

function handleSettings(bot) {
  // 🔁 /subjects — Update Subjects
  bot.onText(/\/subjects/, async (msg) => {
    const chatId = msg.chat.id;

    const user = await User.findOne({ chatId });
    if (!user) {
      return bot.sendMessage(chatId, "❌ You're not subscribed. Use /start first.");
    }

    const allSubjects = await getAllSubjects();
    const keyboard = allSubjects.map(sub => ([{
      text: sub,
      callback_data: `update_subject_${sub}`
    }]));
    keyboard.push([{ text: "✅ Save", callback_data: "save_subject_update" }]);

    userSubjectUpdates.set(chatId, []);
    bot.sendMessage(chatId, "🔧 Choose new subjects:", {
      reply_markup: { inline_keyboard: keyboard },
    });
  });

  // Handle subject selection and saving
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith("update_subject_")) {
      const subject = data.replace("update_subject_", "");
      const selected = userSubjectUpdates.get(chatId) || [];

      if (!selected.includes(subject)) selected.push(subject);
      else selected.splice(selected.indexOf(subject), 1);

      userSubjectUpdates.set(chatId, selected);
      return bot.answerCallbackQuery(query.id, { text: `Selected: ${selected.join(", ")}` });
    }

    if (data === "save_subject_update") {
      const newSubjects = userSubjectUpdates.get(chatId);
      if (!newSubjects || newSubjects.length === 0) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Select at least one subject!" });
      }

      await User.updateOne({ chatId }, { subjects: newSubjects });
      userSubjectUpdates.delete(chatId);

      bot.sendMessage(chatId, `✅ Subjects updated to:\n*${newSubjects.join(", ")}*`, {
        parse_mode: "Markdown",
      });
      return bot.answerCallbackQuery(query.id);
    }
  });

  // ℹ️ /status — Show current settings
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ chatId });

    if (!user) {
      return bot.sendMessage(chatId, "❌ You're not subscribed yet.");
    }

    const statusMsg = `🧾 *Your Subscription Info:*

📬 *Email:* ${user.email || "_Not set_"}
📚 *Subjects:* ${user.subjects.join(", ") || "_None_"}
✅ *Active:* ${user.active ? "Yes" : "No"}
📅 *Last Question:* ${user.lastSent ? new Date(user.lastSent).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Never"}`;

    bot.sendMessage(chatId, statusMsg, { parse_mode: "Markdown" });
  });
}

module.exports = handleSettings;
