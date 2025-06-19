const TelegramBot = require("node-telegram-bot-api");
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const fs = require('fs');
const path = require('path');
const User = require("../models/User");

const SUBSCRIBERS_FILE = path.join(__dirname, './storage/subscribers.json');

// Load saved subscribers
const loadSubscribers = () => {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) return new Set();
  const data = fs.readFileSync(SUBSCRIBERS_FILE);
  return new Set(JSON.parse(data));
};

// Save current subscribers
const saveSubscribers = (subscribersSet) => {
  const data = JSON.stringify([...subscribersSet]);
  fs.writeFileSync(SUBSCRIBERS_FILE, data);
};
const ALL_SUBJECTS = ["JavaScript", "SQL", "Python", "HTML", "CSS", "MongoDB"];

// Init subscribers
const subscribedUsers = loadSubscribers();


// Create bot in polling mode
const bot = new TelegramBot(TOKEN, { polling: true });
const pendingSubjects = new Map(); // chatId => true
const pendingEmails = new Map();   // chatId => subjects
const userSubjectSelections = new Map(); // chatId => [selected subjects]

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const existing = await User.findOne({ chatId });
  if (existing?.active) {
    return bot.sendMessage(chatId, "✅ You're already subscribed.");
  }

  userSubjectSelections.set(chatId, []);
  const keyboard = ALL_SUBJECTS.map(sub => ([{
    text: sub,
    callback_data: `subject_${sub}`
  }]));

  // Add a submit button
  keyboard.push([{ text: "✅ Done", callback_data: "submit_subjects" }]);

  bot.sendMessage(chatId, "📚 Choose your subjects:", {
    reply_markup: { inline_keyboard: keyboard }
  });
});

// Handle /start command
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("subject_")) {
    const subject = data.replace("subject_", "");
    const selected = userSubjectSelections.get(chatId) || [];

    if (!selected.includes(subject)) {
      selected.push(subject);
    } else {
      // Toggle off
      const index = selected.indexOf(subject);
      if (index !== -1) selected.splice(index, 1);
    }

    userSubjectSelections.set(chatId, selected);

    // Optional: edit message to show current selected
    bot.answerCallbackQuery(query.id, { text: `Selected: ${selected.join(", ")}` });
  }

  if (data === "submit_subjects") {
    const subjects = userSubjectSelections.get(chatId) || [];

    if (subjects.length === 0) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Select at least one subject!" });
    }

    userSubjectSelections.delete(chatId);
    pendingEmails.set(chatId, subjects);

    bot.sendMessage(chatId, "📧 (Optional) Enter your email to save it — or type `skip`.");
    bot.answerCallbackQuery(query.id);
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text || text.startsWith("/")) return;

  if (pendingEmails.has(chatId)) {
    const subjects = pendingEmails.get(chatId);
    pendingEmails.delete(chatId);

    let email = null;
    if (text.toLowerCase() !== "skip") {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      if (!isValid) {
        return bot.sendMessage(chatId, "❌ Invalid email. Please enter a valid one or type `skip`.");
      }
      email = text.toLowerCase();
    }

    await User.findOneAndUpdate(
      { chatId },
      { chatId, email, subjects, active: true },
      { upsert: true }
    );

    bot.sendMessage(chatId, `✅ Subscribed!\nWe'll send you questions on: *${subjects.join(", ")}*`, {
      parse_mode: "Markdown"
    });
  }
});



bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  await User.findOneAndUpdate({ chatId }, { active: false });
  bot.sendMessage(chatId, "🛑 You've been unsubscribed.");
});

// Export both the bot and the subscribed users set
module.exports = { bot, subscribedUsers };
