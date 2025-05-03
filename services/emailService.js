const transporter = require('../config/mailer');
const { marked } = require('marked');
const logger = require('../utils/logger');

const sendEmail = async (to, question) => {
  const htmlAnswer = marked.parse(question.answer);

  const mailOptions = {
    from: `"Interview Mailer" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${question.question}`,
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: 0 auto; padding: 10px; background-color: #f7f7f7; border-radius: 8px; border: 1px solid #ddd;">
        <!-- Header Section -->
        <div style="text-align: center; padding-bottom: 20px;">
          <h1 style="color: #2c3e50;">Interview Mailer</h1>
          <p style="font-size: 1.2em; color: #34495e;">Your Daily Question</p>
        </div>
        
        <!-- Question & Difficulty -->
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #2980b9; font-size: 1.5em;">${question.question}</h2>
          <p style="font-size: 1.1em; color: #555;">Difficulty: <strong>${question.difficulty}</strong> | Subject: <strong>${question.subject}</strong></p>
          <hr style="border: 1px solid #ecf0f1;">
          
          <!-- Answer Section -->
          <div style="font-size: 1.1em; color: #2c3e50; line-height: 1.6em;">
            ${htmlAnswer}
          </div>
        </div>
        
        <!-- Footer Section -->
        <div style="text-align: center; padding: 20px 0; font-size: 0.9em; color: #7f8c8d;">
          <p>Source: ${question.source || 'Unknown'}</p>
          <p>Delivered by Lakshay Kamat</p>
        </div>
      </div>
    `,
  };

  try {
    logger.info(`Preparing to send email to: ${to} for question #${question.number}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    logger.error(`Failed to send email to ${to}`, err); 
  }
};

module.exports = sendEmail;
