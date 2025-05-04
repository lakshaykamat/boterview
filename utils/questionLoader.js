const Question = require('../models/Question');

const getRandomQuestionBySubject = async (subject) => {
  const count = await Question.countDocuments({ subject });
  if (count === 0) return null;

  const random = Math.floor(Math.random() * count);
  return await Question.findOne({ subject }).skip(random);
};

module.exports = { getRandomQuestionBySubject };
