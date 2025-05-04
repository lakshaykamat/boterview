const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Question = require('../models/Question'); // Your Mongoose model

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ Connected to MongoDB");

  const dataPath = path.join(__dirname, '../data/sql.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const questions = JSON.parse(rawData);

  // Validate each question using the Mongoose model
  const validQuestions = [];
  for (const q of questions) {
    try {
      const doc = new Question(q);
      await doc.validate(); // Validates against the schema
      validQuestions.push(doc);
    } catch (err) {
      console.error("❌ Validation error for question:", q.number, err.message);
    }
  }

  if (validQuestions.length > 0) {
    await Question.insertMany(validQuestions);
    console.log(`✅ Inserted ${validQuestions.length} valid questions.`);
  } else {
    console.log("⚠️ No valid questions found.");
  }

  mongoose.disconnect();
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});
