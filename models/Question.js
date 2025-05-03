    const mongoose = require('mongoose');

    const QuestionSchema = new mongoose.Schema({
    number: Number,
    question: String,
    difficulty: String,
    answer: String,
    source:String,
    subject:String
    });

    module.exports = mongoose.model('Question', QuestionSchema);
