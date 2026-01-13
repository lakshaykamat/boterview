const { OpenAI } = require('openai');
const logger = require('./logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function askOpenAI(prompt, retryCount = 0) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  try {
    const stream = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: prompt,
        }
      ],
      model: model,
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
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, retryCount); // Exponential backoff
      logger.warn(`OpenAI API error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}): ${error.message}. Retrying in ${delay}ms...`);

      await sleep(delay);
      return askOpenAI(prompt, retryCount + 1);
    }

    logger.error(`OpenAI API failed after ${MAX_RETRIES + 1} attempts: ${error.message}`);
    throw error;
  }
}

module.exports = askOpenAI;
