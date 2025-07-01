const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.DEEPSEEK_R1 || 'API_KEY',
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>',
    'X-Title': '<YOUR_SITE_NAME>',
  },
});
module.exports = openai