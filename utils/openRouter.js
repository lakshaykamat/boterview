const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.DEEPSEEK_R1 || 'API_KEY',
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>',
    'X-Title': '<YOUR_SITE_NAME>',
  },
});

const askOpenRouter = async (prompt)=>{
    try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawContent = completion.choices[0].message.content;
    const parsed = extractJson(rawContent);

    console.log("Parsed Question:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error getting question from R1:", error);
    throw error;
  }
  

}
module.exports = askOpenRouter