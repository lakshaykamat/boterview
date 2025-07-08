const askCebras = require("./cebras");
const askOpenAI = require("./openai");
const askOpenRouter = require("./openRouter");



function extractJson(content) {
  const match = content.match(/\[[\s\S]*\]/); // Look for a JSON array instead of object
  if (!match) throw new Error("No valid JSON array found in response");
  return JSON.parse(match[0]);
}

async function getSubjects(jobRole) {
  const PROMPT = `You are a career and interview preparation expert.

Your task is to generate a focused list of exactly 5 core subjects that a candidate must prepare for technical interviews based on their desired job role.

Instructions:

- The input is: "${jobRole}"
- Based on this role, return only a JSON array of 5 subject names.
- Subjects must be:
  - Highly relevant to this role.
  - Commonly asked in technical interviews.
  - Specific and meaningful (e.g., "SQL", not "Databases").
- List subjects from most to least important.
- Do NOT include explanations, markdown, or comments. Return only the valid JSON array.

Example (for Full Stack Developer):

[
  "JavaScript",
  "React",
  "Node.js",
  "System Design",
  "Database Design"
]

Now respond with only the JSON array of subjects for: "${jobRole}".`;
  // try {
  //   const completion = await openai.chat.completions.create({
  //     model: "deepseek/deepseek-r1-0528:free",
  //     messages: [{ role: "user", content: prompt }],
  //   });

  //   const rawContent = completion.choices[0].message.content;
  //   const parsed = extractJson(rawContent);

  //   console.log("Subjects for", jobRole + ":", parsed);
  //   return parsed;
  // } catch (error) {
  //   console.error("Error getting subjects from R1:", error.message);
  //   throw error;
  // }
  try {
    const response = await askOpenAI(PROMPT)
    const parsed = extractJson(response);

    console.log("Subjects for", jobRole + ":", parsed);
    return parsed;
  } catch (error) {
    console.error("Error getting subjects from R1:", error.message);
    throw error;
  }
}

module.exports = getSubjects;
