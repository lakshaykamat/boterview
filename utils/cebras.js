const Cerebras = require('@cerebras/cerebras_cloud_sdk')

const cerebras = new Cerebras({
  apiKey: process.env.CEBRAS_API_KEY || "API_KEY"
  // This is the default and can be omitted
});

async function askCebras(prompt) {
  const stream = await cerebras.chat.completions.create({
    messages: [
        {
            "role": "system",
            "content": prompt
        }
    ],
    model: 'llama-4-scout-17b-16e-instruct',
    stream: true,
    max_completion_tokens: 2048,
    temperature: 0.2,
    top_p: 1
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    fullResponse += chunk.choices[0]?.delta?.content || '';
  }

  return fullResponse;
}
module.exports = askCebras