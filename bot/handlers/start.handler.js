const User = require("../../models/User");
const Question = require("../../models/Question");

const userSubjectSelections = new Map();
const pendingEmailInput = new Set();

const getAllSubjects = async () => {
  const subjects = await Question.distinct("subject");
  return subjects.sort();
};

// Menu keyboard (reply keyboard)
const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ["/subjects", "/status"],
      ["/stop"]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

function handleStart(bot) {
  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const existing = await User.findOne({ chatId });

    if (existing?.active) {
      return bot.sendMessage(chatId, "✅ You're already subscribed.", mainMenuKeyboard);
    }

    const subjects = await getAllSubjects();
    userSubjectSelections.set(chatId, []);

    const keyboard = subjects.map(sub => ([{
      text: sub,
      callback_data: `subject_${sub}`
    }]));
    keyboard.push([{ text: "✅ Done", callback_data: "submit_subjects" }]);

    await bot.sendMessage(chatId, "📚 *Choose your subjects:* We'll send you questions from these subjects periodically. (You can select more than one.)", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard }
    });
  });

  // Handle subject selection
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith("subject_")) {
      const subject = data.replace("subject_", "");
      const selected = userSubjectSelections.get(chatId) || [];

      if (!selected.includes(subject)) selected.push(subject);
      else selected.splice(selected.indexOf(subject), 1);

      userSubjectSelections.set(chatId, selected);
      return bot.answerCallbackQuery(query.id, {
        text: `Selected: ${selected.join(", ") || "None"}`
      });
    }

    if (data === "submit_subjects") {
      const subjects = userSubjectSelections.get(chatId) || [];
      if (subjects.length === 0) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ Select at least one subject!"
        });
      }

      userSubjectSelections.delete(chatId);
      pendingEmailInput.add(chatId);

      await bot.sendMessage(chatId, "📧 Please enter your email address:", {
        reply_markup: { force_reply: true }
      });

      return bot.answerCallbackQuery(query.id);
    }
  });

  // Handle text messages (email + menu buttons)
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    // Handle menu clicks
    if (text === "📚 Subjects") return bot.emit("text", { ...msg, text: "/subjects" });
    if (text === "📊 Status") return bot.emit("text", { ...msg, text: "/status" });
    if (text === "🛑 Stop") return bot.emit("text", { ...msg, text: "/stop" });

    // Handle email input
    if (pendingEmailInput.has(chatId)) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      if (!isValid) {
        return bot.sendMessage(chatId, "❌ Invalid email. Please enter a valid email address:");
      }

      pendingEmailInput.delete(chatId);

      const subjects = await User.findOne({ chatId }).then(u => u?.subjects) || [];

      await User.findOneAndUpdate(
        { chatId },
        {
          chatId,
          email: text.toLowerCase(),
          subjects,
          active: true,
          lastSent: new Date(0),
        },
        { upsert: true }
      );

      await bot.sendMessage(chatId, `✅ Subscribed!\n📚 Subjects: *${subjects.join(", ")}*\n\nYou'll now receive questions from these subjects at 9 AM, 12 PM, 3 PM, 6 PM, and 9 PM every day.`, {
        parse_mode: "Markdown",
        ...mainMenuKeyboard
      });
    }
  });
}

module.exports = handleStart;
