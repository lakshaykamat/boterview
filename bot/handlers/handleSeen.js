const dayjs = require("dayjs");
const User = require("../../models/User");

function handleMarkSeen(bot) {
  bot.on("callback_query", async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (!data.startsWith("seen_")) return;

    const userId = data.replace("seen_", "");
    const user = await User.findById(userId);
    if (!user) return;

    const today = dayjs().startOf("day");
    const last = dayjs(user.lastActiveDate).startOf("day");

    const alreadyMarked = last.isSame(today);
    if (alreadyMarked) {
      return bot.answerCallbackQuery(query.id, {
        text: "Already marked for today!",
        show_alert: false,
      });
    }

    // Update streak if yesterday was last active
    const isYesterday = last.isSame(today.subtract(1, "day"));
    const newStreak = isYesterday ? user.streak + 1 : 1;

    user.streak = newStreak;
    user.lastActiveDate = new Date();
    await user.save();

    bot.answerCallbackQuery(query.id, {
      text: `🔥 Streak marked! Current streak: ${newStreak}`,
      show_alert: true,
    });
  });
}

module.exports = handleMarkSeen;
