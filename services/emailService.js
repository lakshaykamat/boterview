const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { marked } = require('marked');
const hljs = require('highlight.js');
const transporter = require('../config/mailer');
const logger = require('../utils/logger');

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

const sendEmail = async (to, question) => {
  const htmlAnswer = marked.parse(question.answer);

  const emailHTML = emailTemplate({
    question: question.question,
    subject: question.subject,
    difficulty: question.difficulty || 'Unknown',
    source: question.source || 'Unknown',
    answer: htmlAnswer,
  });

  const mailOptions = {
    from: `"Interview Mailer" <${process.env.EMAIL_USER}>`,
    to,
    subject: question.question,
    html: emailHTML,
  };

  try {
    logger.info(`Preparing to send email to: ${to} for question #${question.number}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    logger.info(`Email sent successfully to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    logger.error(`Failed to send email to ${to}`, err);
  }
};

module.exports = sendEmail;
