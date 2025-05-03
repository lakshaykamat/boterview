const User = require('../models/User');
const sendEmail = require('../services/emailService');
const { getRandomQuestionBySubject } = require('../utils/questionLoader');

const sendQuestionsToUsers = async () => {
  const users = await User.find({ active: true });

  for (const user of users) {
    for (const subject of user.subjects) {
      const question = await getRandomQuestionBySubject(subject);
      if (!question) {
        console.log(`⚠️ No question found for ${subject}`);
        continue;
      }

      await sendEmail(user.email, question);
    }

    user.lastSent = new Date();
    await user.save();
  }
};

module.exports = sendQuestionsToUsers;
