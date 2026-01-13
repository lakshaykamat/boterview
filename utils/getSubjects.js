const askOpenAI = require("./openai");
const logger = require("./logger");

function extractJson(content) {
  if (!content || typeof content !== 'string') {
    throw new Error("Invalid response content");
  }

  // Remove markdown code blocks if present
  let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Try to find JSON array - look for array pattern
  let match = cleaned.match(/\[[\s\S]*\]/);

  // If no match, try parsing the whole cleaned content
  if (!match) {
    cleaned = cleaned.trim();
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
      match = [cleaned];
    }
  }

  if (!match) {
    logger.error(`Failed to extract JSON. Response: ${content.substring(0, 200)}`);
    throw new Error("No valid JSON array found in response");
  }

  try {
    return JSON.parse(match[0]);
  } catch (parseError) {
    logger.error(`JSON parse error. Content: ${match[0].substring(0, 200)}`);
    throw new Error(`Failed to parse JSON array: ${parseError.message}`);
  }
}

function validateSubjects(subjects) {
  if (!Array.isArray(subjects) || subjects.length !== 5) {
    throw new Error(`Expected array of 5 subjects, got ${Array.isArray(subjects) ? subjects.length : typeof subjects}`);
  }

  subjects.forEach((s, i) => {
    if (typeof s !== 'string' || !s.trim()) {
      throw new Error(`Invalid subject at index ${i}`);
    }
  });
}

async function getSubjects(jobRole) {
  const PROMPT = `You are a career and technical interview preparation expert. Your task is to generate exactly 5 core technical subjects that a candidate must master for technical interviews based on their desired job role.

Job Role: "${jobRole}"

CRITICAL: You MUST return ONLY a valid JSON array with no additional text, markdown, or explanations before or after it.

Required Output Format:
["Subject1", "Subject2", "Subject3", "Subject4", "Subject5"]

Subject Selection Criteria:
1. Highly relevant to the job role "${jobRole}"
2. Commonly tested in technical interviews for this role
3. Specific and actionable (e.g., "SQL" not "Databases", "React" not "Frontend")
4. Ordered from most important to least important
5. Cover both fundamental concepts and practical skills
6. Include a mix of:
   - Core programming languages/frameworks
   - System design or architecture (if applicable)
   - Data structures and algorithms
   - Domain-specific knowledge

Examples:

For "Full Stack Developer":
["JavaScript", "React", "Node.js", "System Design", "Database Design"]

For "Data Scientist":
["Python", "Machine Learning", "SQL", "Statistics", "Data Structures"]

For "DevOps Engineer":
["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud Infrastructure"]

Quality Requirements:
- Each subject should be a single, clear topic (2-30 characters)
- Avoid generic terms like "Programming" or "Coding"
- Focus on interview-relevant technical skills
- Ensure subjects are distinct and non-overlapping

Return ONLY the JSON array. No markdown, no code blocks, no explanations.`;

  try {
    const response = await askOpenAI(PROMPT);
    const parsed = extractJson(response);
    validateSubjects(parsed);
    return parsed;
  } catch (error) {
    logger.error(`Error getting subjects for "${jobRole}": ${error.message}`);
    throw error;
  }
}

module.exports = getSubjects;
