const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Question = require("../models/Question");
const EmailLog = require("../models/EmailLog");

router.get("/", async (req, res) => {
  try {
    const [users, questions, logs] = await Promise.all([
      User.find().lean(),
      Question.find().lean(),
      EmailLog.find()
        .populate("userId questionId")
        .sort({ sentAt: -1 })
        .limit(50)
        .lean(),
    ]);

    const totalQuestions = questions.length;
    const questionsBySubject = {};
    const questionsByDifficulty = {};
    const activeUsers = users.filter((u) => u.active).length;

    for (const q of questions) {
      questionsBySubject[q.subject] = (questionsBySubject[q.subject] || 0) + 1;
      questionsByDifficulty[q.difficulty] =
        (questionsByDifficulty[q.difficulty] || 0) + 1;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>📊 Dashboard</title>
</head>
<body class="bg-gray-900 text-gray-200 min-h-screen p-6 font-mono">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-8">📊 Dashboard Overview</h1>

    <!-- Question Stats -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">📋 Question Stats</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-medium text-gray-300 mb-2">By Subject</h3>
          <table class="w-full text-sm border border-gray-700">
            <thead class="bg-gray-700 text-gray-300 uppercase text-xs">
              <tr>
                <th class="px-4 py-2">Subject</th>
                <th class="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(questionsBySubject)
                .map(
                  ([subject, count]) => `
                <tr class="border-t border-gray-700">
                  <td class="px-4 py-2 text-gray-200">${subject}</td>
                  <td class="px-4 py-2 text-gray-400">${count}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-300 mb-2">By Difficulty</h3>
          <table class="w-full text-sm border border-gray-700">
            <thead class="bg-gray-700 text-gray-300 uppercase text-xs">
              <tr>
                <th class="px-4 py-2">Difficulty</th>
                <th class="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(questionsByDifficulty)
                .map(
                  ([difficulty, count]) => `
                <tr class="border-t border-gray-700">
                  <td class="px-4 py-2 text-gray-200">${difficulty}</td>
                  <td class="px-4 py-2 text-gray-400">${count}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
      <p class="mt-4 text-sm text-gray-400">Total Questions: <span class="text-gray-100 font-semibold">${totalQuestions}</span></p>
    </div>

    <!-- User Stats -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">👥 User Stats</h2>
      <table class="w-full text-sm border border-gray-700">
        <thead class="bg-gray-700 text-gray-300 uppercase text-xs">
          <tr>
            <th class="px-4 py-2">Total Users</th>
            <th class="px-4 py-2">Active Users</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t border-gray-700">
            <td class="px-4 py-2 text-gray-200">${users.length}</td>
            <td class="px-4 py-2 text-green-400">${activeUsers}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Email Logs -->
    <div class="bg-gray-800 rounded-lg p-6 shadow-md">
      <h2 class="text-xl font-semibold text-gray-100 mb-4">📬 Recent Email Logs</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-700">
          <thead class="bg-gray-700 text-gray-300 uppercase text-xs">
            <tr>
              <th class="px-4 py-2">Email</th>
              <th class="px-4 py-2">Subject</th>
              <th class="px-4 py-2">Preview</th>
              <th class="px-4 py-2">Question ID</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Sent At</th>
            </tr>
          </thead>
          <tbody>
            ${logs
              .map(
                (log) => `
              <tr class="border-t border-gray-700">
                <td class="px-4 py-2 text-gray-200">${log.email}</td>
                <td class="px-4 py-2 text-gray-300">${log.subject}</td>
                <td class="px-4 py-2 text-gray-400">${(log.questionId?.question || 'N/A').slice(0, 60)}...</td>
                <td class="px-4 py-2 text-gray-400">${log.questionId?._id || 'N/A'}</td>
                <td class="px-4 py-2 text-gray-300">${log.status}</td>
                <td class="px-4 py-2 text-gray-500">${new Date(log.sentAt).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
`;


    res.send(html);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("❌ Failed to load dashboard");
  }
});

module.exports = router;
