const cron = require('node-cron');
const sendNextQuestion = require('../controllers/emailController');

const scheduleEmails = () => {
  const times = ['0 9 * * *', '0 13 * * *', '0 18 * * *'];

  times.forEach((time) => {
    cron.schedule(time, sendNextQuestion);
    console.log(`📆 Scheduled question email at: ${time}`);
  });
  //sendNextQuestion()
};

module.exports = scheduleEmails;
