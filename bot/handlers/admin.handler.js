const User = require("../../models/User");
const MessageLog = require("../../models/MessageLog");

function handleAdmin(bot) {
  const isAdmin = async (chatId) => {
    const user = await User.findOne({ chatId });
    return user?.isAdmin;
  };

  // /broadcast Your message here
  bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const messageText = match[1];

    if (!(await isAdmin(chatId))) {
      return bot.sendMessage(chatId, "❌ You are not authorized to use this command.");
    }

    const users = await User.find({ active: true, chatId: { $ne: null } });
    let success = 0, failed = 0;

    for (const user of users) {
      try {
        await bot.sendMessage(user.chatId, `📢 Broadcast:\n\n${messageText}`);
        await MessageLog.create({
          userId: user._id,
          chatId: user.chatId,
          text: messageText,
          success: true
        });
        success++;
      } catch (err) {
        await MessageLog.create({
          userId: user._id,
          chatId: user.chatId,
          text: messageText,
          success: false,
          error: err.message
        });
        failed++;
      }
    }

    bot.sendMessage(chatId, `✅ Broadcast complete.\nSuccess: ${success}\nFailed: ${failed}`);
  });

  // /stats
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await isAdmin(chatId))) {
      return bot.sendMessage(chatId, "❌ You are not authorized to use this command.");
    }

    const total = await User.countDocuments();
    const active = await User.countDocuments({ active: true });
    const paused = await User.countDocuments({ active: false });
    const logs = await MessageLog.countDocuments();
    const todayLogs = await MessageLog.countDocuments({
      sentAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    const statsMessage = `📊 *Bot Stats*

Total users: ${total}
Active: ${active}
Paused: ${paused}

Total messages sent: ${logs}
Messages today: ${todayLogs}
    `;

    bot.sendMessage(chatId, statsMessage, { parse_mode: "Markdown" });
  });
}

module.exports = handleAdmin;
