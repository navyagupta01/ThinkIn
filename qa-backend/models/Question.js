const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
  },
  timestamp: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  upvoters: [{ type: String }],
  isResolved: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  subject: { type: String },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
});

questionSchema.index({ title: 'text', content: 'text', tags: 'text' });
questionSchema.index({ lastActivity: -1, upvotes: -1, views: -1 });

module.exports = mongoose.model('Question', questionSchema);