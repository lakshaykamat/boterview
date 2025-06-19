const cron = require("node-cron");
const sendNextQuestion = require("../controllers/emailController");
const sendTelegramQuestion = require("../controllers/telegramController");

const scheduleEmails = () => {
  // Define the times in IST (India Standard Time)
  const times = [
    "0 9 * * *",
    "0 12 * * *",
    "0 15 * * *",
    "0 18 * * *",
    "0 21 * * *",
  ];

  // Schedule the jobs using IST timezone
  times.forEach((time) => {
    cron.schedule(time, sendNextQuestion, {
      timezone: "Asia/Kolkata", // Specify the timezone as IST
    });
    console.log(`📆 Scheduled question email at: ${time} IST`);
  });
};

const scheduleTelegramMessage = () => {
  const times = ['0 9 * * *', '0 12 * * *', '0 15 * * *', '0 18 * * *', '0 21 * * *'];
  //const times = ['*/5 * * * * *']

  times.forEach((time) => {
    cron.schedule(time, sendTelegramQuestion, {
      timezone: "Asia/Kolkata",
    });
    console.log(`📨 Scheduled Telegram message at: ${time} IST`);
  });
};
module.exports = { scheduleEmails, scheduleTelegramMessage };
