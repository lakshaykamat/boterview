const askOpenAI = require("./openai");
const logger = require("./logger");

function extractJson(content) {
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid response content");
  }

  // Remove markdown code blocks if present
  let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Try to find JSON object - look for object pattern
  let match = cleaned.match(/\{[\s\S]*\}/);

  // If no match, try parsing the whole cleaned content
  if (!match) {
    cleaned = cleaned.trim();
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      match = [cleaned];
    }
  }

  if (!match) {
    logger.error(`Failed to extract JSON. Response: ${content.substring(0, 200)}`);
    throw new Error("No valid JSON found in response");
  }

  try {
    return JSON.parse(match[0]);
  } catch (parseError) {
    logger.error(`JSON parse error. Content: ${match[0].substring(0, 200)}`);
    throw new Error(`Failed to parse JSON: ${parseError.message}`);
  }
}

function validateQuestion(question, subjectName) {
  const required = ['number', 'question', 'difficulty', 'answer', 'source', 'subject'];
  const missing = required.filter(field => !question[field]);
  if (missing.length) throw new Error(`Missing fields: ${missing.join(', ')}`);

  if (question.subject !== subjectName) {
    throw new Error(`Subject mismatch: expected "${subjectName}"`);
  }

  const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
  if (!validDifficulties.includes(question.difficulty)) {
    throw new Error(`Invalid difficulty: "${question.difficulty}"`);
  }
}

async function getQuestion(subjectName) {
  const PROMPT = `You are an expert technical interview question generator. Your task is to create a high-quality interview question and answer for the subject: "${subjectName}".

CRITICAL: You MUST return ONLY a valid JSON object with no additional text, markdown, or explanations before or after it.

Required JSON Schema:
{
  "number": <positive integer>,
  "question": "<string - concise interview question>",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "answer": "<string - detailed answer with markdown formatting>",
  "source": "<string - source or origin of question>",
  "subject": "${subjectName}"
}

Field Requirements:

1. number: A positive integer (e.g., 1, 2, 3...)
2. question: A clear, concise technical interview question (10+ characters). Should be specific and test practical knowledge.
3. difficulty: Must be exactly one of: "Beginner", "Intermediate", or "Advanced"
4. answer: A comprehensive, technically accurate answer (20+ characters) that includes:
   - Clear explanation of concepts
   - Use markdown formatting:
     * **bold** for emphasis
     * __italic__ for subtle emphasis
     * \`\`\`language for code blocks with language specification
   - Code examples when relevant
   - Best practices or edge cases when applicable
5. source: Origin of the question (e.g., "LeetCode", "System Design Interview", "Common Interview Question", etc.)
6. subject: Must exactly match "${subjectName}"

Quality Standards:
- The question should be realistic and commonly asked in technical interviews
- The answer must be accurate, complete, and educational
- Code examples should be syntactically correct
- The difficulty level should accurately reflect the complexity

Output Format:
Return ONLY the JSON object. No markdown code blocks, no explanations, no additional text. Just the raw JSON.`;

  try {
    const response = await askOpenAI(PROMPT);
    const parsed = extractJson(response);
    validateQuestion(parsed, subjectName);
    return parsed;
  } catch (error) {
    logger.error(`Error getting question for "${subjectName}": ${error.message}`);
    throw error;
  }
}

module.exports = getQuestion;
