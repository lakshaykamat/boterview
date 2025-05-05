const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const Question = require('../models/Question');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (query) => new Promise(resolve => rl.question(query, ans => resolve(ans.trim())));

(async () => {
  try {
    const fileName = await prompt('📄 Enter the JSON filename (in /data): ');
    const dataPath = path.join(__dirname, '../data', fileName);

    if (!fs.existsSync(dataPath)) {
      console.error('❌ File not found.');
      rl.close();
      process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const questions = JSON.parse(rawData);

    console.log(`\n📊 Loaded ${questions.length} questions from file.`);

    const preview = questions.slice(0, 3).map(q => `- ${q.question}`).join('\n');
    console.log(`\n🔍 Preview of first 3 questions:\n${preview}\n`);

    const proceed = await prompt('❓ Do you want to validate and insert into DB? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('❌ Operation cancelled.');
      rl.close();
      process.exit(0);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ Connected to MongoDB');

    const validQuestions = [];
    let invalidCount = 0;

    for (const q of questions) {
      try {
        const doc = new Question(q);
        await doc.validate();
        validQuestions.push(doc);
      } catch (err) {
        invalidCount++;
        console.error(`❌ Invalid question: ${q.question}\n   Reason: ${err.message}`);
      }
    }

    console.log(`\n✅ Valid questions: ${validQuestions.length}`);
    console.log(`❌ Invalid questions: ${invalidCount}`);

    if (validQuestions.length === 0) {
      console.log('⚠️ No valid questions to insert.');
      mongoose.disconnect();
      rl.close();
      return;
    }

    const confirmInsert = await prompt('🚀 Proceed to insert valid questions into DB? (y/n): ');
    if (confirmInsert.toLowerCase() === 'y') {
      await Question.insertMany(validQuestions);
      console.log(`🎉 Successfully inserted ${validQuestions.length} questions.`);
    } else {
      console.log('❌ Insert cancelled.');
    }

    mongoose.disconnect();
    rl.close();
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    mongoose.disconnect();
    rl.close();
  }
})();
