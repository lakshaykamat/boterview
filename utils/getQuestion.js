const askCebras = require("./cebras");
const openai = require("./openai");

function extractJson(content) {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No valid JSON found in response");
  return JSON.parse(match[0]);
}

async function getQuestionFromR1(subjectName) {
  
const PROMPT = `You are an expert AI that ONLY returns valid JSON in the exact schema below:

\`\`\`json
{
  "number": Number,
  "question": String,
  "difficulty": "Begginner" | "Intermediate" | "Advanced",
  "answer": String,
  "source": String,
  "subject": String
}
\`\`\`

Output Requirements:

- You MUST return only a single valid JSON object. Do not include any comments, markdown syntax, explanations, or surrounding text.
- Each field in the JSON must contain accurate, realistic, and interview-relevant content.
- The subject field must exactly match: ${subjectName}.
- The question should be concise but clear, suitable for technical interviews.
- The answer must:

  - Use special formatting where appropriate:

    - Enclose bold text with double asterisks → \`**text**\`
    - Enclose italic text with double underscores → \`__text__\`
    - Enclose monospaced/code text with triple backticks → \`\`\`text\`\`\`

  - For code blocks, use:
    - Triple backticks and specify the language (e.g., \`\`\`javascript)
    - Example:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

- The answer should be complete, technically correct, and formatted cleanly with the rules above.

Important Constraints:

- Return ONLY the JSON object.
- The answer must contain at least one of the formatting styles mentioned above.
- The JSON must be valid and parsable.`

  // try {
  //   const completion = await openai.chat.completions.create({
  //     model: "deepseek/deepseek-r1-0528:free",
  //     messages: [
  //       {
  //         role: 'user',
  //         content: prompt,
  //       },
  //     ],
  //   });

  //   const rawContent = completion.choices[0].message.content;
  //   const parsed = extractJson(rawContent);

  //   console.log("Parsed Question:", parsed);
  //   return parsed;
  // } catch (error) {
  //   console.error("Error getting question from R1:", error);
  //   throw error;
  // }
  try {
    const response = await askCebras(PROMPT)
    const parsed = extractJson(response);

    console.log("Parsed Question:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error getting question from R1:", error);
    throw error;
  }
}

module.exports = getQuestionFromR1;
