const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
});

async function askOpenAI(prompt) {
  const stream = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      }
    ],
    model: 'gpt-4',
    stream: true,
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 1,
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    fullResponse += chunk.choices[0]?.delta?.content || '';
  }

  return fullResponse;
}

module.exports = askOpenAI;
