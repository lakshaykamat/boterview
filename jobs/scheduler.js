const cron = require('node-cron');
const sendNextQuestion = require('../controllers/emailController');

const scheduleEmails = () => {
  const times = ['0 9 * * *', '0 12 * * *', '0 15 * * *', '0 18 * * *', '0 21 * * *'];

  times.forEach((time) => {
    cron.schedule(time, sendNextQuestion);
    console.log(`📆 Scheduled question email at: ${time}`);
  });
};

module.exports = scheduleEmails;
