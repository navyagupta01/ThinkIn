const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Post a new question
router.post('/questions', authenticate, async (req, res) => {
  try {
    const { title, content, tags, subject } = req.body;
    const question = new Question({
      title,
      content,
      author: {
        id: req.user.uid,
        name: req.user.name,
        role: req.user.role,
        avatar: req.user.avatar,
      },
      tags: tags || [],
      subject,
      lastActivity: new Date(),
    });
    await question.save();
    res.status(201).json({ ...question.toObject(), hasUpvoted: false });
  } catch (error) {
    console.error('Error posting question:', error);
    res.status(500).json({ error: 'Failed to post question' });
  }
});

// Get all questions with filters and sorting
router.get('/questions', authenticate, async (req, res) => {
  try {
    console.log('Received request for /api/qa/questions', req.query); // Debug log
    const { search, filter, sort, subject } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (filter === 'resolved') query.isResolved = true;
    if (filter === 'unresolved') query.isResolved = false;
    if (filter === 'my-questions') query['author.id'] = req.user.uid;
    if (subject) query.subject = new RegExp(subject, 'i');

    const sortOptions = {
      recent: { lastActivity: -1 },
      popular: { upvotes: -1 },
      views: { views: -1 },
    };

    const questions = await Question.find(query)
      .sort(sortOptions[sort] || sortOptions.recent)
      .populate({
        path: 'answers',
        select: '-__v',
        options: { sort: { timestamp: -1 } },
      })
      .lean();

    // Add hasUpvoted field
    const questionsWithUpvoteStatus = questions.map((q) => ({
      ...q,
      hasUpvoted: q.upvoters.includes(req.user.uid),
      answers: q.answers ? q.answers.map((a) => ({
        ...a,
        hasUpvoted: a.upvoters.includes(req.user.uid),
      })) : [],
    }));

    console.log('Questions fetched:', questionsWithUpvoteStatus.length, 'Answers per question:', questionsWithUpvoteStatus.map(q => q.answers.length)); // Debug log
    res.json(questionsWithUpvoteStatus);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json([]);
  }
});

// Update a question
router.put('/questions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, subject } = req.body;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (question.author.id !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized: Not the question author' });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;
    question.subject = subject || question.subject;
    question.lastActivity = new Date();
    await question.save();

    res.json({ ...question.toObject(), hasUpvoted: question.upvoters.includes(req.user.uid) });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
router.delete('/questions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (question.author.id !== req.user.uid && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Question.deleteOne({ _id: id });
    await Answer.deleteMany({ questionId: id });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Increment question views
router.post('/questions/:id/view', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    question.views += 1;
    await question.save();
    res.status(200).send();
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ error: 'Failed to increment views' });
  }
});

// Toggle upvote for a question
router.post('/question/:id/upvote', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const userId = req.user.uid;
    const hasUpvoted = question.upvoters.includes(userId);

    if (hasUpvoted) {
      question.upvoters = question.upvoters.filter((uid) => uid !== userId);
      question.upvotes -= 1;
    } else {
      question.upvoters.push(userId);
      question.upvotes += 1;
    }

    await question.save();
    res.json({ upvotes: question.upvotes, hasUpvoted: !hasUpvoted });
  } catch (error) {
    console.error('Error toggling question upvote:', error);
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
});

// Post an answer
router.post('/answers', authenticate, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const answer = new Answer({
      questionId,
      content,
      author: {
        id: req.user.uid,
        name: req.user.name,
        role: req.user.role,
        avatar: req.user.avatar,
      },
    });
    await answer.save();

    // Update question's answers array
    question.answers.push(answer._id);
    question.lastActivity = new Date();
    await question.save();

    console.log('Answer posted for question:', questionId, 'Answer ID:', answer._id); // Debug log
    res.status(201).json({ ...answer.toObject(), hasUpvoted: false });
  } catch (error) {
    console.error('Error posting answer:', error);
    res.status(500).json({ error: 'Failed to post answer' });
  }
});

// Update an answer
router.put('/answers/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    if (answer.author.id !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized: Not the answer author' });
    }

    answer.content = content || answer.content;
    answer.edited = true;
    answer.editedAt = new Date();
    await answer.save();

    const question = await Question.findById(answer.questionId);
    if (question) {
      question.lastActivity = new Date();
      await question.save();
    }

    res.json({ ...answer.toObject(), hasUpvoted: answer.upvoters.includes(req.user.uid) });
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

// Delete an answer
router.delete('/answers/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    if (answer.author.id !== req.user.uid && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const question = await Question.findById(answer.questionId);
    if (question) {
      question.answers = question.answers.filter(a => a.toString() !== id);
      question.lastActivity = new Date();
      await question.save();
    }

    await Answer.deleteOne({ _id: id });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// Toggle upvote for an answer
router.post('/answer/:id/upvote', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await Answer.findById(id);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const userId = req.user.uid;
    const hasUpvoted = answer.upvoters.includes(userId);

    if (hasUpvoted) {
      answer.upvoters = answer.upvoters.filter((uid) => uid !== userId);
      answer.upvotes -= 1;
    } else {
      answer.upvoters.push(userId);
      answer.upvotes += 1;
    }

    await answer.save();
    res.json({ upvotes: answer.upvotes, hasUpvoted: !hasUpvoted });
  } catch (error) {
    console.error('Error toggling answer upvote:', error);
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
});

// Mark an answer as correct (teacher-only)
router.post('/questions/:questionId/answers/:answerId/correct', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized: Teachers only' });
    }

    const { questionId, answerId } = req.params;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    answer.isCorrect = true;
    question.isResolved = true;
    question.lastActivity = new Date();

    await answer.save();
    await question.save();

    res.status(200).send();
  } catch (error) {
    console.error('Error marking answer as correct:', error);
    res.status(500).json({ error: 'Failed to mark answer as correct' });
  }
});

// Get answers for a question
router.get('/questions/:questionId/answers', authenticate, async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .sort({ timestamp: -1 })
      .lean();
    console.log('Answers fetched for question:', req.params.questionId, 'Count:', answers.length); // Debug log
    const answersWithUpvoteStatus = answers.map((a) => ({
      ...a,
      hasUpvoted: a.upvoters.includes(req.user.uid),
    }));
    res.json(answersWithUpvoteStatus);
  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

module.exports = router;