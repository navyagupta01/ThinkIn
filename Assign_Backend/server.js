const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const PDFParser = require('pdf-parse');
const { Document, Packer } = require('docx');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const logger = require('pino')();

// Initialize Express app
const app = express();
const port = 5002;

// Middleware
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads and reports directories exist
const uploadDir = 'uploads';
const reportDir = 'uploads/reports';
async function ensureDirectories() {
  if (!(await fs.access(uploadDir).then(() => true).catch(() => false))) {
    await fs.mkdir(uploadDir, { recursive: true });
    logger.info(`Created uploads directory: ${uploadDir}`);
  }
  if (!(await fs.access(reportDir).then(() => true).catch(() => false))) {
    await fs.mkdir(reportDir, { recursive: true });
    logger.info(`Created reports directory: ${reportDir}`);
  }
}
ensureDirectories();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.info(`Saving file to ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    logger.info(`Generated filename: ${uniqueName} for original file: ${file.originalname}`);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.txt', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and DOCX files are allowed'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/learning_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error(`MongoDB connection error: ${err}`));

// MongoDB Schemas
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: String, required: true },
  deadline: { type: Date, required: true },
  files: [{ filename: String, path: String, originalName: String }],
  criteria: [{ type: String }],
  maxScore: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  files: [{ filename: String, path: String, originalName: String }],
  submittedAt: { type: Date, default: Date.now },
  aiGrade: {
    finalScore: Number,
    percentage: Number,
    scoreBreakdown: Object,
    qualityMetrics: Object,
    styleMetrics: Object,
    semanticAnalysis: Object,
    sentimentAnalysis: Object,
    comprehensiveFeedback: Object
  },
  teacherGrade: { type: Number },
  teacherFeedback: { type: String },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  reportPath: { type: String }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
const Submission = mongoose.model('Submission', submissionSchema);

// Middleware to check user role
const checkRole = (roles) => (req, res, next) => {
  const userRole = req.headers['x-user-role'] || req.body.userRole;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid role' });
  }
  next();
};

// Function to extract text from files
async function extractTextFromFile(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  try {
    if (ext === '.pdf') {
      const data = await PDFParser(await fs.readFile(filepath));
      return data.text;
    } else if (ext === '.txt') {
      return await fs.readFile(filepath, 'utf-8');
    } else if (ext === '.docx') {
      const doc = await Document.load(filepath);
      return doc.paragraphs.map(p => p.text).join('\n');
    }
    return '';
  } catch (err) {
    logger.error(`Error extracting text from ${filepath}: ${err.message}`);
    return '';
  }
}

// Flask API client
const FLASK_API_URL = 'http://localhost:6000/api/grade';

// Routes
app.put('/api/assignments/:id', checkRole(['teacher']), upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, criteria, maxScore, userId } = req.body;
    const files = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      originalName: file.originalname
    }));

    const criteriaArray = criteria ? (Array.isArray(criteria) ? criteria : criteria.split('\n').filter(c => c.trim())) : [];

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (assignment.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Not your assignment' });
    }

    assignment.title = title;
    assignment.description = description;
    assignment.deadline = new Date(deadline);
    assignment.criteria = criteriaArray;
    assignment.maxScore = parseInt(maxScore) || 100;
    if (files.length > 0) {
      for (const file of assignment.files) {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          logger.warn(`Failed to delete old file ${file.path}: ${err.message}`);
        }
      }
      assignment.files = files;
    }

    await assignment.save();
    logger.info(`Assignment ${id} updated by teacher ${userId}`);
    res.json({ message: 'Assignment updated successfully', assignment });
  } catch (error) {
    logger.error(`Error updating assignment: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assignments', checkRole(['teacher']), upload.array('files', 5), async (req, res) => {
  try {
    const { title, description, deadline, criteria, maxScore, userId } = req.body;
    const files = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      originalName: file.originalname
    }));

    const criteriaArray = criteria ? (Array.isArray(criteria) ? criteria : criteria.split('\n').filter(c => c.trim())) : [];

    const assignment = new Assignment({
      title,
      description,
      teacherId: userId,
      deadline: new Date(deadline),
      files,
      criteria: criteriaArray,
      maxScore: parseInt(maxScore) || 100
    });

    await assignment.save();
    logger.info(`Assignment created: ${title} by teacher ${userId}`);
    res.status(201).json({ message: 'Assignment created successfully', assignment });
  } catch (error) {
    logger.error(`Error creating assignment: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assignments/:id/submit', checkRole(['student']), upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;
    const files = req.files;

    if (!userName) {
      return res.status(400).json({ error: 'User name is required' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ error: 'Submission deadline has passed' });
    }

    const existingSubmission = await Submission.findOne({ assignmentId: id, studentId: userId });
    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted this assignment' });
    }

    // Extract text from files
    let text = '';
    for (const file of files) {
      const extractedText = await extractTextFromFile(file.path);
      if (!extractedText) {
        return res.status(400).json({ error: `Failed to extract text from ${file.originalname}` });
      }
      text += extractedText + '\n';
    }
    logger.info(`Extracted text (first 500 chars): ${text.slice(0, 500)}`);

    // Send to Flask /api/grade endpoint
    const requestData = {
      text,
      criteria: assignment.criteria,
      max_score: assignment.maxScore
    };
    logger.info(`Sending to Flask: ${JSON.stringify(requestData, null, 2).slice(0, 500)}`);
    const flaskResponse = await axios.post(FLASK_API_URL, requestData, {
      headers: { 'Content-Type': 'application/json' }
    });

    const gradeData = flaskResponse.data;
    logger.info(`Received grade data from Flask: ${JSON.stringify(gradeData, null, 2).slice(0, 500)}`);

    const reportFileName = `report_${uuidv4()}.json`;
    const reportPath = path.join(reportDir, reportFileName);
    await fs.writeFile(reportPath, JSON.stringify(gradeData, null, 2));
    logger.info(`Saved report to ${reportPath}`);

    const submission = new Submission({
      assignmentId: id,
      studentId: userId,
      studentName: userName,
      files: files.map(file => ({
        filename: file.filename,
        path: file.path,
        originalName: file.originalname
      })),
      aiGrade: {
        finalScore: gradeData.final_score,
        percentage: gradeData.percentage,
        scoreBreakdown: gradeData.score_breakdown,
        qualityMetrics: gradeData.quality_metrics,
        styleMetrics: gradeData.style_metrics,
        semanticAnalysis: gradeData.semantic_analysis,
        sentimentAnalysis: gradeData.sentiment_analysis,
        comprehensiveFeedback: gradeData.comprehensive_feedback
      },
      status: 'submitted',
      reportPath
    });

    await submission.save();

    // Clean up uploaded files
    for (const file of files) {
      try {
        await fs.unlink(file.path);
        logger.info(`Deleted file: ${file.path}`);
      } catch (err) {
        logger.warn(`Failed to delete file ${file.path}: ${err.message}`);
      }
    }

    logger.info(`Submission created for assignment ${id} by student ${userName}`);
    res.status(201).json({ message: 'Submission successful', submission });
  } catch (error) {
    logger.error(`Error submitting assignment: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/submissions/:id/grade', checkRole(['teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherGrade, teacherFeedback, userId } = req.body;

    const submission = await Submission.findById(id).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.assignmentId.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Not your assignment' });
    }

    submission.teacherGrade = teacherGrade;
    submission.teacherFeedback = teacherFeedback;
    submission.status = 'graded';
    await submission.save();

    logger.info(`Submission ${id} graded by teacher ${userId}`);
    res.json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    logger.error(`Error grading submission: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const userRole = req.headers['x-user-role'] || req.query.userRole;

    let assignments;
    if (userRole === 'teacher') {
      assignments = await Assignment.find({ teacherId: userId });
    } else {
      assignments = await Assignment.find({ deadline: { $gte: new Date() } });
    }

    res.json(assignments);
  } catch (error) {
    logger.error(`Error fetching assignments: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    logger.error(`Error fetching assignment ${id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] || req.query.userId;
    const userRole = req.headers['x-user-role'] || req.query.userRole;

    const submission = await Submission.findById(id).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (userRole === 'student' && submission.studentId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Not your submission' });
    }
    if (userRole === 'teacher' && submission.assignmentId.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Not your assignment' });
    }

    res.json(submission);
  } catch (error) {
    logger.error(`Error fetching submission ${id}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/submissions', checkRole(['teacher', 'student']), async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const userRole = req.headers['x-user-role'] || req.query.userRole;
    const assignmentId = req.query.assignmentId;

    const query = {};
    if (userRole === 'student') {
      query.studentId = userId;
    }
    if (assignmentId) {
      query.assignmentId = assignmentId;
    }

    const submissions = await Submission.find(query).populate('assignmentId');

    if (userRole === 'teacher') {
      const filteredSubmissions = submissions.filter(
        submission => submission.assignmentId.teacherId === userId
      );
      return res.json(filteredSubmissions);
    }

    res.json(submissions);
  } catch (error) {
    logger.error(`Error fetching submissions: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/submissions/:assignmentId/reports', checkRole(['teacher']), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.headers['x-user-id'];

    const submissions = await Submission.find({ assignmentId }).populate('assignmentId');
    if (!submissions.length) {
      return res.status(404).json({ error: 'No submissions found for this assignment' });
    }

    if (submissions[0].assignmentId.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Not your assignment' });
    }

    const reports = submissions.map(submission => ({
      submissionId: submission._id,
      studentId: submission.studentId,
      studentName: submission.studentName,
      reportPath: submission.reportPath,
      aiGrade: submission.aiGrade,
      submittedAt: submission.submittedAt
    }));

    res.json(reports);
  } catch (error) {
    logger.error(`Error fetching reports for assignment ${assignmentId}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/:submissionId', checkRole(['teacher']), async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.headers['x-user-id'];

    const submission = await Submission.findById(submissionId).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.assignmentId.teacherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Not your assignment' });
    }

    if (!submission.reportPath || !(await fs.access(submission.reportPath).then(() => true).catch(() => false))) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = JSON.parse(await fs.readFile(submission.reportPath, 'utf8'));
    res.json(reportData);
  } catch (error) {
    logger.error(`Error fetching report for submission ${submissionId}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const userRole = req.headers['x-user-role'] || req.query.userRole;

    let stats = {
      totalAssignments: 0,
      submittedAssignments: 0,
      pendingAssignments: 0,
      grades: []
    };

    if (userRole === 'teacher') {
      const assignments = await Assignment.find({ teacherId: userId });
      stats.totalAssignments = assignments.length;

      const submissions = await Submission.find({ assignmentId: { $in: assignments.map(a => a._id) } })
        .populate('assignmentId');
      stats.submittedAssignments = submissions.length;

      const gradedSubmissions = submissions.filter(s => s.status === 'graded');
      stats.grades = gradedSubmissions.map(s => ({
        assignmentId: s.assignmentId._id,
        assignmentTitle: s.assignmentId.title,
        studentId: s.studentId,
        studentName: s.studentName,
        aiGrade: s.aiGrade.finalScore,
        teacherGrade: s.teacherGrade,
        percentage: s.aiGrade.percentage
      }));
    } else {
      const assignments = await Assignment.find({ deadline: { $gte: new Date() } });
      stats.totalAssignments = assignments.length;

      const submissions = await Submission.find({ studentId: userId })
        .populate('assignmentId');
      stats.submittedAssignments = submissions.length;
      stats.pendingAssignments = stats.totalAssignments - stats.submittedAssignments;

      stats.grades = submissions.map(s => ({
        assignmentId: s.assignmentId._id,
        assignmentTitle: s.assignmentId.title,
        studentId: s.studentId,
        studentName: s.studentName,
        aiGrade: s.aiGrade.finalScore,
        teacherGrade: s.teacherGrade,
        percentage: s.aiGrade.percentage
      }));
    }

    res.json(stats);
  } catch (error) {
    logger.error(`Error fetching stats: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});