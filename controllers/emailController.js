const User = require("../models/User");
const sendEmail = require("../services/emailService");
const { getRandomQuestionBySubject } = require("../utils/questionLoader");

const sendQuestionsToUsers = async () => {
  const users = await User.find({ active: true });

  for (const user of users) {
    if (!user.subjects || user.subjects.length === 0) continue;

    // Pick one random subject from user's list
    const randomSubject =
      user.subjects[Math.floor(Math.random() * user.subjects.length)];

    const question = await getRandomQuestionBySubject(randomSubject);
    if (!question) {
      console.log(
        `⚠️ No question found for subject "${randomSubject}" for user ${user.email}`
      );
      continue;
    }

    await sendEmail(user, question);

    user.lastSent = new Date();
    await user.save();
  }
};
// sendQuestionsToUsers()
module.exports = sendQuestionsToUsers;
