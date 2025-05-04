const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
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

    await sendEmail(user.email, question);

    try {
      await EmailLog.create({
        userId: user._id,
        email: user.email,
        subject: question.subject,
        questionId: question._id,
        status: "sent",
      });
    } catch (err) {
      console.error(`❌ Failed to send to ${user.email}: ${err.message}`);
      await EmailLog.create({
        userId: user._id,
        email: user.email,
        subject: subject,
        questionId: question._id || null,
        status: "failed",
        error: err.message,
      });
    }

    user.lastSent = new Date();
    await user.save();
  }
};

module.exports = sendQuestionsToUsers;
