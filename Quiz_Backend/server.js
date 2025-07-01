const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/quiz_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  points: {
    type: Number,
    default: 1
  }
});

const QuizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    unique: true,
    default: uuidv4
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  questions: [QuestionSchema],
  createdBy: {
    type: String, // teacher username
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  dueDate: {
    type: Date
  },
  allowedAttempts: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const AttemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    unique: true,
    default: uuidv4
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz', // Reference to Quiz model
    required: true
  },
  studentUsername: {
    type: String,
    required: true
  },
  answers: [{
    questionId: String,
    selectedAnswer: String,
    isCorrect: Boolean,
    topic: String,
    timeTaken: Number // in seconds
  }],
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  topicPerformance: [{
    topic: String,
    correct: Number,
    total: Number,
    percentage: Number
  }]
});

const SWOTAnalysisSchema = new mongoose.Schema({
  studentUsername: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  overallPerformance: {
    totalQuizzes: Number,
    averageScore: Number,
    totalTimeSpent: Number,
    improvementTrend: String // 'improving', 'declining', 'stable'
  },
  strengths: [{
    topic: String,
    averageScore: Number,
    confidence: String, // 'high', 'medium', 'low'
    description: String
  }],
  weaknesses: [{
    topic: String,
    averageScore: Number,
    errorPattern: String,
    description: String,
    improvementSuggestion: String
  }],
  opportunities: [{
    topic: String,
    description: String,
    actionPlan: String,
    priority: String // 'high', 'medium', 'low'
  }],
  threats: [{
    topic: String,
    description: String,
    riskLevel: String, // 'high', 'medium', 'low'
    mitigation: String
  }],
  recommendations: [{
    category: String, // 'study_plan', 'time_management', 'focus_areas'
    suggestion: String,
    priority: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
SWOTAnalysisSchema.index({ studentUsername: 1, subject: 1 });
AttemptSchema.index({ studentUsername: 1, quizId: 1 });

// Models
const Quiz = mongoose.model('Quiz', QuizSchema);
const Attempt = mongoose.model('Attempt', AttemptSchema);
const SWOTAnalysis = mongoose.model('SWOTAnalysis', SWOTAnalysisSchema);

const validateQuizPayload = (req, res, next) => {
  const { title, subject, duration, questions, createdBy, dueDate } = req.body;
  
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Quiz title is required' });
  }
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }
  if (!duration || duration < 1) {
    return res.status(400).json({ error: 'Valid duration is required' });
  }
  if (!createdBy?.trim()) {
    return res.status(400).json({ error: 'CreatedBy is required' });
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'At least one question is required' });
  }
  if (dueDate && new Date(dueDate) < new Date()) {
    return res.status(400).json({ error: 'Due date must be in the future' });
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.questionText?.trim()) {
      return res.status(400).json({ error: `Question ${i + 1}: Question text is required` });
    }
    if (!q.topic?.trim()) {
      return res.status(400).json({ error: `Question ${i + 1}: Topic is required` });
    }
    if (!q.correctAnswer?.trim()) {
      return res.status(400).json({ error: `Question ${i + 1}: Correct answer is required` });
    }
    if (!q.options || q.options.filter(opt => opt.text?.trim()).length < 2) {
      return res.status(400).json({ error: `Question ${i + 1}: At least 2 valid options are required` });
    }
    if (!q.options.some(opt => opt.isCorrect)) {
      return res.status(400).json({ error: `Question ${i + 1}: At least one option must be marked as correct` });
    }
  }

  next();
};

// SWOT Analysis Generator
class SWOTAnalyzer {
  static async generateSWOTAnalysis(studentUsername, subject) {
    try {
      const quizzes = await Quiz.find({ subject: subject });
      const quizIds = quizzes.map(q => q._id);
      const attempts = await Attempt.find({ 
        studentUsername: studentUsername,
        quizId: { $in: quizIds }
      }).sort({ submittedAt: -1 });

      if (attempts.length === 0) {
        return null;
      }

      const topicAnalysis = this.analyzeTopicPerformance(attempts);
      const overallPerformance = this.calculateOverallPerformance(attempts);
      
      const strengths = this.identifyStrengths(topicAnalysis);
      const weaknesses = this.identifyWeaknesses(topicAnalysis);
      const opportunities = this.identifyOpportunities(topicAnalysis, attempts);
      const threats = this.identifyThreats(topicAnalysis, attempts);
      const recommendations = this.generateRecommendations(strengths, weaknesses, opportunities, threats);

      const swotAnalysis = {
        studentUsername,
        subject,
        overallPerformance,
        strengths,
        weaknesses,
        opportunities,
        threats,
        recommendations,
        lastUpdated: new Date()
      };

      await SWOTAnalysis.findOneAndUpdate(
        { studentUsername, subject },
        swotAnalysis,
        { upsert: true, new: true }
      );

      return swotAnalysis;
    } catch (error) {
      console.error('Error generating SWOT analysis:', error);
      throw error;
    }
  }

  static analyzeTopicPerformance(attempts) {
    const topicStats = {};
    
    attempts.forEach(attempt => {
      attempt.answers.forEach(answer => {
        if (!topicStats[answer.topic]) {
          topicStats[answer.topic] = {
            correct: 0,
            total: 0,
            timeTaken: [],
            recentPerformance: []
          };
        }
        
        topicStats[answer.topic].total++;
        if (answer.isCorrect) {
          topicStats[answer.topic].correct++;
        }
        topicStats[answer.topic].timeTaken.push(answer.timeTaken || 0);
        topicStats[answer.topic].recentPerformance.push({
          correct: answer.isCorrect,
          date: attempt.submittedAt
        });
      });
    });

    Object.keys(topicStats).forEach(topic => {
      const stats = topicStats[topic];
      stats.percentage = (stats.correct / stats.total) * 100;
      stats.averageTime = stats.timeTaken.reduce((a, b) => a + b, 0) / stats.timeTaken.length;
      
      const recent = stats.recentPerformance.slice(0, 3);
      const older = stats.recentPerformance.slice(3, 6);
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.filter(r => r.correct).length / recent.length;
        const olderAvg = older.filter(r => r.correct).length / older.length;
        
        if (recentAvg > olderAvg + 0.1) stats.trend = 'improving';
        else if (recentAvg < olderAvg - 0.1) stats.trend = 'declining';
        else stats.trend = 'stable';
      } else {
        stats.trend = 'stable';
      }
    });

    return topicStats;
  }

  static calculateOverallPerformance(attempts) {
    const totalQuizzes = attempts.length;
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalQuizzes;
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    
    let improvementTrend = 'stable';
    if (attempts.length >= 3) {
      const recent = attempts.slice(0, Math.ceil(attempts.length / 3));
      const older = attempts.slice(-Math.ceil(attempts.length / 3));
      
      const recentAvg = recent.reduce((sum, a) => sum + a.percentage, 0) / recent.length;
      const olderAvg = older.reduce((sum, a) => sum + a.percentage, 0) / older.length;
      
      if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
      else if (recentAvg < olderAvg - 5) improvementTrend = 'declining';
    }

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore * 100) / 100,
      totalTimeSpent,
      improvementTrend
    };
  }

  static identifyStrengths(topicAnalysis) {
    const strengths = [];
    
    Object.entries(topicAnalysis).forEach(([topic, stats]) => {
      if (stats.percentage >= 80) {
        strengths.push({
          topic,
          averageScore: Math.round(stats.percentage * 100) / 100,
          confidence: stats.percentage >= 90 ? 'high' : 'medium',
          description: `Excellent performance in ${topic} with ${stats.percentage.toFixed(1)}% accuracy`
        });
      }
    });

    return strengths.sort((a, b) => b.averageScore - a.averageScore);
  }

  static identifyWeaknesses(topicAnalysis) {
    const weaknesses = [];
    
    Object.entries(topicAnalysis).forEach(([topic, stats]) => {
      if (stats.percentage < 60) {
        let errorPattern = 'Consistent errors';
        if (stats.trend === 'declining') errorPattern = 'Declining performance';
        else if (stats.averageTime > 120) errorPattern = 'Time management issues';
        
        weaknesses.push({
          topic,
          averageScore: Math.round(stats.percentage * 100) / 100,
          errorPattern,
          description: `Struggling with ${topic} - ${stats.percentage.toFixed(1)}% accuracy`,
          improvementSuggestion: this.generateImprovementSuggestion(topic, stats)
        });
      }
    });

    return weaknesses.sort((a, b) => a.averageScore - b.averageScore);
  }

  static identifyOpportunities(topicAnalysis, attempts) {
    const opportunities = [];
    
    Object.entries(topicAnalysis).forEach(([topic, stats]) => {
      if (stats.percentage >= 60 && stats.percentage < 80) {
        opportunities.push({
          topic,
          description: `Potential for improvement in ${topic}`,
          actionPlan: `Focus on practice problems and review incorrect answers`,
          priority: stats.trend === 'improving' ? 'high' : 'medium'
        });
      }
      
      if (stats.trend === 'improving') {
        opportunities.push({
          topic,
          description: `Showing improvement trend in ${topic}`,
          actionPlan: `Continue current study approach and increase practice frequency`,
          priority: 'high'
        });
      }
    });

    return opportunities;
  }

  static identifyThreats(topicAnalysis, attempts) {
    const threats = [];
    
    Object.entries(topicAnalysis).forEach(([topic, stats]) => {
      if (stats.trend === 'declining') {
        threats.push({
          topic,
          description: `Declining performance in ${topic}`,
          riskLevel: stats.percentage < 50 ? 'high' : 'medium',
          mitigation: `Immediate review and additional practice required`
        });
      }
      
      if (stats.percentage < 40) {
        threats.push({
          topic,
          description: `Critical weakness in ${topic}`,
          riskLevel: 'high',
          mitigation: `Seek additional help and dedicate more study time`
        });
      }
    });

    return threats;
  }

  static generateImprovementSuggestion(topic, stats) {
    if (stats.averageTime > 120) {
      return `Practice time management for ${topic} questions`;
    } else if (stats.percentage < 40) {
      return `Review fundamental concepts in ${topic}`;
    } else {
      return `Focus on practice problems in ${topic}`;
    }
  }

  static generateRecommendations(strengths, weaknesses, opportunities, threats) {
    const recommendations = [];

    if (weaknesses.length > 0) {
      recommendations.push({
        category: 'study_plan',
        suggestion: `Prioritize studying: ${weaknesses.slice(0, 3).map(w => w.topic).join(', ')}`,
        priority: 'high'
      });
    }

    const timeIssues = weaknesses.filter(w => w.errorPattern.includes('time'));
    if (timeIssues.length > 0) {
      recommendations.push({
        category: 'time_management',
        suggestion: 'Practice timed exercises and improve question-solving speed',
        priority: 'medium'
      });
    }

    if (opportunities.length > 0) {
      recommendations.push({
        category: 'focus_areas',
        suggestion: `Capitalize on improving topics: ${opportunities.slice(0, 2).map(o => o.topic).join(', ')}`,
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

// API Routes

// Create Quiz
app.post('/api/quizzes', validateQuizPayload, async (req, res) => {
  try {
    const { title, subject, description, duration, difficulty, questions, createdBy, dueDate, allowedAttempts, status } = req.body;
    
    const quiz = new Quiz({
      title,
      subject,
      description,
      duration,
      difficulty,
      questions: questions.map(q => ({
        ...q,
        questionId: uuidv4()
      })),
      createdBy,
      dueDate: dueDate ? new Date(dueDate) : null,
      allowedAttempts: allowedAttempts || 1,
      status: status || 'draft'
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quizId: quiz.quizId });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update Quiz
app.put('/api/quizzes/:quizId', validateQuizPayload, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, subject, description, duration, difficulty, questions, createdBy, dueDate, allowedAttempts, status } = req.body;

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.createdBy !== createdBy) {
      return res.status(403).json({ error: 'Not authorized to update this quiz' });
    }

    quiz.title = title?.trim() || quiz.title;
    quiz.subject = subject || quiz.subject;
    quiz.description = description?.trim() || quiz.description;
    quiz.duration = duration || quiz.duration;
    quiz.difficulty = difficulty || quiz.difficulty;
    quiz.questions = questions.map(q => ({
      ...q,
      questionId: q.questionId || uuidv4()
    })) || quiz.questions;
    quiz.dueDate = dueDate ? new Date(dueDate) : quiz.dueDate;
    quiz.allowedAttempts = allowedAttempts || quiz.allowedAttempts;
    quiz.status = status || quiz.status;
    quiz.updatedAt = new Date();

    await quiz.save();
    res.json({ message: 'Quiz updated successfully', quizId: quiz.quizId });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Get All Quizzes (for students)
app.get('/api/quizzes', async (req, res) => {
  try {
    const { studentUsername } = req.query;
    const currentDate = new Date();
    const quizzes = await Quiz.find({ 
      status: 'published',
      $or: [
        { dueDate: { $gte: currentDate } },
        { dueDate: null }
      ]
    }).select('-questions.correctAnswer');
    
    if (studentUsername) {
      const quizzesWithAttempts = await Promise.all(
        quizzes.map(async (quiz) => {
          const attemptCount = await Attempt.countDocuments({
            quizId: quiz._id,
            studentUsername: studentUsername
          });
          
          return {
            ...quiz.toObject(),
            attemptCount,
            canAttempt: attemptCount < quiz.allowedAttempts && (!quiz.dueDate || new Date(quiz.dueDate) >= currentDate)
          };
        })
      );
      
      res.json(quizzesWithAttempts);
    } else {
      res.json(quizzes);
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get Quiz by ID (for taking quiz)
app.get('/api/quizzes/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentUsername } = req.query;
    
    const quiz = await Quiz.findOne({ quizId }).select('-questions.correctAnswer');
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.status !== 'published') {
      return res.status(403).json({ error: 'Quiz is not published' });
    }

    if (quiz.dueDate && new Date(quiz.dueDate) < new Date()) {
      return res.status(403).json({ error: 'Quiz due date has passed' });
    }

    if (studentUsername) {
      const attemptCount = await Attempt.countDocuments({
        quizId: quiz._id,
        studentUsername: studentUsername
      });
      
      if (attemptCount >= quiz.allowedAttempts) {
        return res.status(403).json({ error: 'Maximum attempts reached' });
      }
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit Quiz Attempt
app.post('/api/quizzes/:quizId/submit', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { studentUsername, answers, timeSpent, startedAt } = req.body;
    
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quiz.dueDate && new Date(quiz.dueDate) < new Date()) {
      return res.status(403).json({ error: 'Quiz due date has passed' });
    }

    const attemptCount = await Attempt.countDocuments({
      quizId: quiz._id,
      studentUsername: studentUsername
    });
    
    if (attemptCount >= quiz.allowedAttempts) {
      return res.status(403).json({ error: 'Maximum attempts reached' });
    }

    let score = 0;
    const maxScore = quiz.questions.length;
    const analyzedAnswers = [];
    const topicPerformance = {};

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index]?.selectedAnswer;
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) score++;
      
      analyzedAnswers.push({
        questionId: question._id.toString(),
        selectedAnswer: userAnswer,
        isCorrect,
        topic: question.topic,
        timeTaken: answers[index]?.timeTaken || 0
      });

      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[question.topic].total++;
      if (isCorrect) topicPerformance[question.topic].correct++;
    });

    const percentage = (score / maxScore) * 100;

    const attempt = new Attempt({
      quizId: quiz._id, // Use the MongoDB _id
      studentUsername,
      answers: analyzedAnswers,
      score,
      maxScore,
      percentage,
      timeSpent,
      startedAt: new Date(startedAt),
      topicPerformance: Object.entries(topicPerformance).map(([topic, perf]) => ({
        topic,
        correct: perf.correct,
        total: perf.total,
        percentage: (perf.correct / perf.total) * 100
      }))
    });

    await attempt.save();

    try {
      await SWOTAnalyzer.generateSWOTAnalysis(studentUsername, quiz.subject);
    } catch (swotError) {
      console.error('Error generating SWOT analysis:', swotError);
    }

    res.json({
      message: 'Quiz submitted successfully',
      attemptId: attempt.attemptId,
      score,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      topicPerformance: attempt.topicPerformance
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get Student Results
app.get('/api/students/:studentUsername/results', async (req, res) => {
  try {
    const { studentUsername } = req.params;
    const { subject } = req.query;
    
    let filter = { studentUsername };
    if (subject) {
      const quizzes = await Quiz.find({ subject });
      const quizIds = quizzes.map(q => q._id);
      filter.quizId = { $in: quizIds };
    }
    
    const attempts = await Attempt.find(filter)
      .populate('quizId', 'title subject')
      .sort({ submittedAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get SWOT Analysis for Student
app.get('/api/students/:studentUsername/swot', async (req, res) => {
  try {
    const { studentUsername } = req.params;
    const { subject } = req.query;
    
    let filter = { studentUsername };
    if (subject) filter.subject = subject;
    
    const swotAnalyses = await SWOTAnalysis.find(filter).sort({ lastUpdated: -1 });
    res.json(swotAnalyses);
  } catch (error) {
    console.error('Error fetching SWOT analysis:', error);
    res.status(500).json({ error: 'Failed to fetch SWOT analysis' });
  }
});

// Get All Students' SWOT Analysis (for teachers)
app.get('/api/teacher/swot-analysis', async (req, res) => {
  try {
    const { subject, teacherUsername } = req.query;
    
    let filter = {};
    if (subject) filter.subject = subject;
    
    const swotAnalyses = await SWOTAnalysis.find(filter).sort({ studentUsername: 1, lastUpdated: -1 });
    
    const studentAnalyses = {};
    swotAnalyses.forEach(analysis => {
      if (!studentAnalyses[analysis.studentUsername]) {
        studentAnalyses[analysis.studentUsername] = [];
      }
      studentAnalyses[analysis.studentUsername].push(analysis);
    });
    
    res.json(studentAnalyses);
  } catch (error) {
    console.error('Error fetching teacher SWOT analyses:', error);
    res.status(500).json({ error: 'Failed to fetch SWOT analyses' });
  }
});

// Get Teacher's Quizzes
app.get('/api/teacher/:teacherUsername/quizzes', async (req, res) => {
  try {
    const { teacherUsername } = req.params;
    const quizzes = await Quiz.find({ createdBy: teacherUsername }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching teacher quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get Teacher's Drafts
app.get('/api/teacher/:teacherUsername/drafts', async (req, res) => {
  try {
    const { teacherUsername } = req.params;
    const drafts = await Quiz.find({ createdBy: teacherUsername, status: 'draft' }).sort({ createdAt: -1 });
    res.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Update Quiz Status
app.patch('/api/quizzes/:quizId/status', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { status } = req.body;
    
    const quiz = await Quiz.findOneAndUpdate(
      { quizId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json({ message: 'Quiz status updated successfully', quiz });
  } catch (error) {
    console.error('Error updating quiz status:', error);
    res.status(500).json({ error: 'Failed to update quiz status' });
  }
});

// Get Quiz Analytics
app.get('/api/quizzes/:quizId/analytics', async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const attempts = await Attempt.find({ quizId: quiz._id });
    
    const analytics = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length : 0,
      highestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
      lowestScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0,
      averageTime: attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length : 0,
      topicPerformance: {},
      studentPerformance: attempts.map(attempt => ({
        studentUsername: attempt.studentUsername,
        score: attempt.score,
        percentage: attempt.percentage,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt
      }))
    };
    
    attempts.forEach(attempt => {
      attempt.topicPerformance.forEach(topic => {
        if (!analytics.topicPerformance[topic.topic]) {
          analytics.topicPerformance[topic.topic] = {
            totalQuestions: 0,
            totalCorrect: 0,
            attempts: 0
          };
        }
        analytics.topicPerformance[topic.topic].totalQuestions += topic.total;
        analytics.topicPerformance[topic.topic].totalCorrect += topic.correct;
        analytics.topicPerformance[topic.topic].attempts++;
      });
    });
    
    Object.keys(analytics.topicPerformance).forEach(topic => {
      const perf = analytics.topicPerformance[topic];
      perf.averagePercentage = (perf.totalCorrect / perf.totalQuestions) * 100;
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Quiz Backend Server running on port ${PORT}`);
  console.log('MongoDB connected');
});

module.exports = app;