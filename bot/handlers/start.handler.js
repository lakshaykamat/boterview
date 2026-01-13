const User = require("../../models/User");
const getSubjectsFromR1 = require("../../utils/getSubjects");
const logger = require("../../utils/logger");

const userSubjectSelections = new Map();
const pendingEmailInput = new Set();
const pendingJobRoleInput = new Set();

const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ["/subjects", "/status", "/history"],
      ["/stop", "/start"],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

const sendMainMenu = async (bot, chatId, isAdmin) => {
  const userCommands = [
    ["/start", "/status"],
    ["/subjects", "/history"],
    ["/stop"],
  ];
  const adminCommands = [["/broadcast", "/stats"]];
  const keyboard = isAdmin ? [...userCommands, ...adminCommands] : userCommands;

  await bot.sendMessage(chatId, "📋 Here's your menu:", {
    reply_markup: {
      keyboard,
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
};

function handleStart(bot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const existing = await User.findOne({ chatId });

    if (existing?.active) {
      return bot.sendMessage(chatId, "✅ You're already subscribed.");
    }

    pendingJobRoleInput.add(chatId);

    await bot.sendMessage(
      chatId,
      "Please enter your desired job role (e.g., Frontend Developer, Data Analyst, ML Engineer):",
      { reply_markup: { force_reply: true } }
    );

    await sendMainMenu(bot, chatId, existing?.isAdmin);
  });

  // Handle button menu clicks
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (text === "📚 Subjects")
      return bot.emit("text", { ...msg, text: "/subjects" });
    if (text === "📊 Status")
      return bot.emit("text", { ...msg, text: "/status" });
    if (text === "🛑 Stop") return bot.emit("text", { ...msg, text: "/stop" });

    // Handle job role input
    if (pendingJobRoleInput.has(chatId)) {
      if (!text || text.trim().length < 2) {
        return bot.sendMessage(
          chatId,
          "❌ Please enter a valid job role (minimum 2 characters):"
        );
      }
      pendingJobRoleInput.delete(chatId);

      await bot.sendMessage(
        chatId,
        `⏳ Generating interview subjects for: *${text}*`,
        {
          parse_mode: "Markdown",
        }
      );

      try {
        const subjects = await getSubjectsFromR1(text);
        userSubjectSelections.set(chatId, subjects);

        const keyboard = [
          ...subjects.map((s) => [
            { text: s, callback_data: `subject_static` },
          ]),
          [
            {
              text: "🔁 Regenerate Subjects",
              callback_data: "regenerate_subjects",
            },
            { text: "✅ Confirm Subjects", callback_data: "submit_subjects" },
          ],
        ];

        await bot.sendMessage(
          chatId,
          `📚 Based on your role *${text}*, here are your suggested subjects:

${subjects.map((s, i) => `${i + 1}. ${s}`).join("\n")}

🔄 You can *Regenerate* or *Confirm* your subjects now.
📝 Or use the /subjects command later to explicitly set your subject list.`,
          {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard },
          }
        );
      } catch (err) {
        logger.error(`Subject generation error for chat ${chatId}: ${err.message}`, err);
        await bot.sendMessage(
          chatId,
          "❌ Failed to fetch subjects. Please try again."
        );
      }
    }

    // Handle email input
    if (pendingEmailInput.has(chatId)) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      if (!isValid) {
        return bot.sendMessage(
          chatId,
          "❌ Invalid email. Please enter a valid email address:"
        );
      }

      pendingEmailInput.delete(chatId);
      const subjects = userSubjectSelections.get(chatId) || [];

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

      await bot.sendMessage(
        chatId,
        `✅ Subscribed!\n📚 Subjects: *${subjects.join(
          ", "
        )}*\n\nYou'll now receive questions every 2 hours.`,
        {
          parse_mode: "Markdown",
          ...mainMenuKeyboard,
        }
      );
    }
  });

  // Handle subject confirm/regenerate buttons
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === "regenerate_subjects") {
      pendingJobRoleInput.add(chatId);
      await bot.sendMessage(
        chatId,
        "🔁 Please enter your job role again to regenerate subjects:",
        { reply_markup: { force_reply: true } }
      );
      return bot.answerCallbackQuery(query.id);
    }

    if (data === "submit_subjects") {
      const subjects = userSubjectSelections.get(chatId);
      if (!subjects || subjects.length === 0) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ No subjects selected.",
        });
      }

      userSubjectSelections.set(chatId, subjects);
      pendingEmailInput.add(chatId);

      await bot.sendMessage(chatId, "📧 Please enter your email address:", {
        reply_markup: { force_reply: true },
      });

      return bot.answerCallbackQuery(query.id);
    }

    return bot.answerCallbackQuery(query.id);
  });
}

module.exports = handleStart;
