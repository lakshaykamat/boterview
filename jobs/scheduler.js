const cron = require("node-cron");
const sendNextQuestion = require("../controllers/emailController");
const sendTelegramQuestion = require("../controllers/telegramController");
const logger = require("../utils/logger");

const scheduleEmails = () => {
  cron.schedule("0 */6 * * *", sendNextQuestion, {
    timezone: "Asia/Kolkata",
  });
  logger.info("📆 Scheduled question emails every 6 hours (IST)");
};

const scheduleTelegramMessage = () => {
  cron.schedule("0 */6 * * *", sendTelegramQuestion, {
    timezone: "Asia/Kolkata",
  });
  logger.info("📨 Scheduled Telegram messages every 6 hours (IST)");
};
module.exports = { scheduleEmails, scheduleTelegramMessage };
