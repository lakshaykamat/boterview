const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (query) => new Promise(resolve => rl.question(query, ans => resolve(ans.trim())));

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

const listUsers = async () => {
  const users = await User.find();
  if (!users.length) return console.log('No users found.');
  users.forEach((u, i) => console.log(`${i + 1}. ${u.email} - Subjects: ${u.subjects.join(', ')}`));
};

const listSubjects = async () => {
  const users = await User.find();
  const allSubjects = new Set();
  users.forEach(u => u.subjects.forEach(sub => allSubjects.add(sub)));
  console.log('📚 Available Subjects:', Array.from(allSubjects).join(', '));
};

const createOrUpdateUser = async () => {
  const email = await ask('Enter user email: ');
  const subjectsInput = await ask('Enter subjects (comma separated): ');
  const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log(`⚠️  User with email "${email}" already exists.`);
    const confirmUpdate = await ask('Do you want to update this user\'s subjects? (y/n): ');
    if (confirmUpdate.toLowerCase() === 'y') {
      existingUser.subjects = subjects;
      await existingUser.save();
      console.log(`✅ User updated: ${email}`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  } else {
    const confirmCreate = await ask(`Create new user with email "${email}" and subjects: [${subjects.join(', ')}]? (y/n): `);
    if (confirmCreate.toLowerCase() === 'y') {
      const user = new User({ email, subjects });
      await user.save();
      console.log(`✅ User created: ${email}`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  }
};

const main = async () => {
  await connectDB();

  console.log('\n--- User Management CLI ---');
  console.log('1. List all users');
  console.log('2. List available subjects');
  console.log('3. Create or update a user');
  console.log('4. Exit');

  const choice = await ask('Select an option (1-4): ');

  switch (choice) {
    case '1':
      await listUsers();
      break;
    case '2':
      await listSubjects();
      break;
    case '3':
      await createOrUpdateUser();
      break;
    case '4':
      console.log('Exiting...');
      break;
    default:
      console.log('Invalid option.');
  }

  rl.close();
  await disconnectDB();
};

main();