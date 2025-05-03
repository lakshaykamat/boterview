const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const createUser = async (email, subjects) => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    const user = new User({
      email,
      subjects,
    });

    await user.save();
    console.log(`✅ User created: ${email}`);
  } catch (err) {
    console.error(`❌ Error creating user:`, err.message);
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

createUser(emailArg, subjectsArg.split(','));
