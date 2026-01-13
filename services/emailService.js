const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { marked } = require('marked');
const hljs = require('highlight.js');
const transporter = require('../config/mailer');
const logger = require('../utils/logger');
const EmailLog = require("../models/EmailLog")

marked.setOptions({
  highlight: function (code, lang) {
    const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language: validLang }).value;
  },
  langPrefix: 'hljs language-',
});

const templatePath = path.join(__dirname, '../templates/email.html');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const emailTemplate = handlebars.compile(templateSource);

const sendEmail = async (user, question) => {
  const htmlAnswer = marked.parse(question.answer);

  const emailHTML = emailTemplate({
    question: question.question,
    subject: question.subject,
    difficulty: question.difficulty || 'Unknown',
    source: question.source || 'Unknown',
    questionId: question._id,
    answer: htmlAnswer,
  });

  const mailOptions = {
    from: `"Interview Mailer" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: question.question,
    html: emailHTML,
  };
  try {
    logger.info(`Preparing to send email to: ${user.email} for question id - ${question._id}`);
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent to ${user.email}: ${info.response}`);
    await EmailLog.create({
      userId: user._id,
      email: user.email,
      subject: question.subject,
      questionId: question._id,
      status: "sent",
    });
  } catch (err) {
    logger.error(`❌ Failed to send email to ${user.email}: ${err.message}`, err);
    await EmailLog.create({
      userId: user._id,
      email: user.email,
      subject: question.subject,
      questionId: question._id || null,
      status: "failed",
      error: err.message,
    });
  }
};

module.exports = sendEmail;
