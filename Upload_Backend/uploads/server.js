const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/education_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

// File filter to allow specific content types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/mpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: images (jpg, png), videos (mp4, mpeg), documents (pdf, doc, docx)'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Content Schema
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'Video', 'Image'], required: true },
  filePath: { type: String, required: true },
  fileSize: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const Content = mongoose.model('Content', contentSchema);

// API Endpoints

// Upload content
app.post('/api/content', upload.single('file'), async (req, file, res) => {
  try {
    const { title, subject, type } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB'; // Convert to MB
    const content = new Content({
      title,
      subject,
      type,
      filePath: req.file.path,
      fileSize,
    });

    await content.save();
    res.status(201).json({ message: 'Content uploaded successfully', content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all content with optional filtering
app.get('/api/content', async (req, res) => {
  try {
    const { subject, type } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (type) query.type = type;

    const content = await Content.find(query).sort({ uploadDate: -1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});