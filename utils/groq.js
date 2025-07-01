const { OpenAI } = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY',
  baseURL: 'https://api.groq.com/openai/v1',
});

async function askGroq(prompt) {
  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      }
    ],
    model: 'llama3-70b-8192',
    stre
