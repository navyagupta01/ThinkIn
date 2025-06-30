const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = 5009;

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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer configuration with file size limit (100MB)
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Content Schema
const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'Video', 'Image', 'Document', 'Presentation', 'Other'], required: true },
  filePath: { type: String, required: true },
  fileSize: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const Content = mongoose.model('Content', contentSchema);

// API Endpoints

// Upload content
app.post('/api/content', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, type } = req.body;
    if (!title || !subject || !type || !req.file) {
      return res.status(400).json({ error: 'Title, subject, type, and file are required' });
    }

    // Determine content type based on file extension if needed
    let之下
finalType = type;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (['.ppt', '.pptx'].includes(fileExtension)) {
      finalType = 'Presentation';
    } else if (['.pdf'].includes(fileExtension) && type !== 'Presentation') {
      finalType = 'PDF';
    } else if (['.mp4', '.mov', '.avi'].includes(fileExtension)) {
      finalType = 'Video';
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
      finalType = 'Image';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      finalType = 'Document';
    }

    if (!['PDF', 'Video', 'Image', 'Document', 'Presentation', 'Other'].includes(finalType)) {
      return res.status(400).json({ error: 'Invalid content type. Allowed: PDF, Video, Image, Document, Presentation, Other' });
    }

    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const content = new Content({
      title,
      subject,
      type: finalType,
      filePath: req.file.path,
      fileSize,
    });

    await content.save();
    res.status(201).json({ message: 'Content uploaded successfully', content });
  } catch (error) {
    console.error('Error uploading content:', error);
    res.status(500).json({ error: error.message || 'Server error during upload' });
  }
});

// Get all content with optional filtering
app.get('/api/content', async (req, res) => {
  try {
    const { subject, type, limit } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (type) query.type = type;

    const contentQuery = Content.find(query).sort({ uploadDate: -1 });
    if (limit) contentQuery.limit(parseInt(limit));

    const content = await contentQuery;
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: error.message || 'Server error fetching content' });
  }
});

// Get single content by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: error.message || 'Server error fetching content' });
  }
});

// Update content
app.put('/api/content/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, type } = req.body;

    // Find existing content
    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Update fields
    if (title) content.title = title;
    if (subject) content.subject = subject;
    if (type) {
      if (!['PDF', 'Video', 'Image', 'Document', 'Presentation', 'Other'].includes(type)) {
        return res.status(400).json({ error: 'Invalid content type' });
      }
      content.type = type;
    }
    if (req.file) {
      // Delete old file if a new one is uploaded
      if (fs.existsSync(content.filePath)) {
        fs.unlinkSync(content.filePath);
      }
      content.filePath = req.file.path;
      content.fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    }

    await content.save();
    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: error.message || 'Server error during update' });
  }
});

// Get unique subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Content.distinct('subject');
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: error.message || 'Server error fetching subjects' });
  }
});

// Error handling for file upload limits
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});