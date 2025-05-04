const sendEmail = require('../services/emailService');
const { getRandomQuestionBySubject } = require('./questionLoader');
async function sendTestEmail() {
    try{
        const question = await getRandomQuestionBySubject('JavaScript')
        await sendEmail('lakshayykamat@gmail.com',question)
        console.log('Test email sent successfully!')
    }catch(e){
        console.log(e)
        console.log('Failed to send test email')
    }
}
module.exports = sendTestEmail;