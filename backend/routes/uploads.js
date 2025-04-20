const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const fetchuser = require('../middleware/fetchuser');
const multer = require('multer');
// const path = require('path');
const fs = require('fs');

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-rar-compressed',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// ROUTE 1: Upload a document
router.post('/upload', fetchuser, upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const userId = req.user.id;

    const documents = files.map((file) => ({
      user: userId,
      name: file.originalname,
      type: file.mimetype.split('/')[1],
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      createdBy: req.user.name || 'Current User',
      filePath: file.path,
    }));

    const savedDocuments = await Document.insertMany(documents);
    res.json({ success: true, documents: savedDocuments });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ROUTE 2: Fetch all documents for a user
router.get('/', fetchuser, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id });
    res.json(documents);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ROUTE 3: Delete a document
router.delete('/:id', fetchuser, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Delete file from filesystem
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ROUTE 4: Download a document
router.get('/download/:id', fetchuser, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ error: ' Behavior' });
    }

    const filePath = document.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, document.name);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ROUTE 5: Update document (e.g., tags, favorite, folder)
router.put('/:id', fetchuser, async (req, res) => {
  try {
    const { tags, favorite, folder } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    document.tags = tags !== undefined ? tags : document.tags;
    document.favorite = favorite !== undefined ? favorite : document.favorite;
    document.folder = folder !== undefined ? folder : document.folder;
    document.lastModified = Date.now();

    const updatedDocument = await document.save();
    res.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ROUTE 6: Sort and filter documents
router.get('/filter', fetchuser, async (req, res) => {
  try {
    const { search, folder, tags, sortBy } = req.query;
    let query = { user: req.user.id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (folder && folder !== 'All Files') {
      query.folder = folder;
    }
    if (tags) {
      query.tags = { $all: tags.split(',') };
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'nameAsc':
        sortOptions.name = 1;
        break;
      case 'nameDesc':
        sortOptions.name = -1;
        break;
      case 'dateAsc':
        sortOptions.lastModified = 1;
        break;
      case 'dateDesc':
        sortOptions.lastModified = -1;
        break;
      case 'sizeAsc':
        sortOptions.size = 1;
        break;
      case 'sizeDesc':
        sortOptions.size = -1;
        break;
      default:
        sortOptions.lastModified = -1;
    }

    const documents = await Document.find(query).sort(sortOptions);
    res.json(documents);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;