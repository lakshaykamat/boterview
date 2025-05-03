const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');

// Prompt wrapper using readline
const promptYesNo = (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${question} (y/n): `, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
};

const createOrUpdateUser = async (email, subjects) => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`⚠️  User with email "${email}" already exists.`);
      const confirmUpdate = await promptYesNo('Do you want to update this user\'s subjects?');

      if (confirmUpdate) {
        existingUser.subjects = subjects;
        await existingUser.save();
        console.log(`✅ User updated: ${email}`);
      } else {
        console.log('❌ Operation cancelled.');
      }
    } else {
      const confirmCreate = await promptYesNo(`Create new user with email "${email}" and subjects: [${subjects.join(', ')}]?`);
      if (confirmCreate) {
        const user = new User({ email, subjects });
        await user.save();
        console.log(`✅ User created: ${email}`);
      } else {
        console.log('❌ Operation cancelled.');
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

// CLI usage: node scripts/createUser.js user@example.com JavaScript,Node.js
const [,, emailArg, subjectsArg] = process.argv;

if (!emailArg || !subjectsArg) {
  console.error('❌ Usage: node scripts/createUser.js <email> <subject1,subject2,...>');
  process.exit(1);
}

const email = emailArg.trim();
const subjects = subjectsArg.split(',').map(s => s.trim()).filter(Boolean);

createOrUpdateUser(email, subjects);


// CLI usage example: node scripts/createUser.js dev@example.com JavaScript,Node.js
