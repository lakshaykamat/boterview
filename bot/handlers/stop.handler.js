const User = require("../../models/User")

function handleStop(bot) {
  bot.onText(/\/stop/, async (msg) => {
    const chatId = msg.chat.id;
    await User.findOneAndUpdate({ chatId }, { active: false });
    bot.sendMessage(chatId, "🛑 You've been unsubscribed.");
  });
}

module.exports = handleStop;
