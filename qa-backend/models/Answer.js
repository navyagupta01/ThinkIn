const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  content: { type: String, required: true },
  author: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
    avatar: { type: String },
  },
  timestamp: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  upvoters: [{ type: String }],
  isCorrect: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
});

module.exports = mongoose.model('Answer', answerSchema);