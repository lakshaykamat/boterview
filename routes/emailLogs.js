const express = require('express');
const router = express.Router();
const EmailLog = require('../models/EmailLog');

router.get('/', async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ sentAt: -1 }).limit(100);

    let output = '📬 Email Delivery Logs (latest 100)\n\n';

    logs.forEach((log, index) => {
      output += `#${index + 1}\n`;
      output += `To        : ${log.email}\n`;
      output += `Subject   : ${log.subject}\n`;
      output += `Question  : ${log.questionId}\n`;
      output += `Status    : ${log.status.toUpperCase()}\n`;
      output += `Sent At   : ${new Date(log.sentAt).toLocaleString()}\n`;
      output += `User ID   : ${log.userId}\n`;
      output += `------------------------------\n`;
    });

    res.type('text').send(output);
  } catch (err) {
    res.status(500).type('text').send('❌ Error fetching logs.');
  }
});

module.exports = router;
