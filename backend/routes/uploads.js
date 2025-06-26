const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const fetchuser = require('../middleware/fetchuser');
const uploadToS3 = require('../utils/uploadToS3');
const AWS = require('aws-sdk');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize AWS S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Upload route
router.post('/upload', fetchuser, upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const userId = req.user.id;
    console.log('Uploading files for user:', userId, 'Files:', files.map(f => f.originalname)); // Debug

    const uploadPromises = files.map(async (file) => {
      const s3Result = await uploadToS3(file);
      console.log('S3 upload result:', s3Result); // Debug

      return {
        user: userId,
        name: file.originalname,
        type: file.mimetype.split('/')[1],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        createdBy: req.user.name || 'Current User',
        filePath: s3Result.Location, // Keep for reference, though not used for private buckets
        s3Key: s3Result.Key,
      };
    });

    const documents = await Promise.all(uploadPromises);
    const savedDocuments = await Document.insertMany(documents);
    console.log('Saved documents:', savedDocuments); // Debug

    res.json({ success: true, documents: savedDocuments });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all documents for a user
router.get('/documents', fetchuser, async (req, res) => {
  try {
    console.log('Fetching documents for user:', req.user.id); // Debug
    const documents = await Document.find({ user: req.user.id });
    console.log('Found documents:', documents); // Debug
    res.json(documents);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Filter documents with query parameters
router.get('/filter', fetchuser, async (req, res) => {
  try {
    const { search, folder, tags, sortBy } = req.query;
    console.log('Filter query:', { search, folder, tags, sortBy, user: req.user.id }); // Debug
    let query = { user: req.user.id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (folder && folder !== 'All Files') {
      query.folder = folder;
    }

    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $all: tagsArray };
    }

    if (folder === 'Favorites') {
      query.favorite = true;
    }

    if (folder === 'Recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.lastModified = { $gte: thirtyDaysAgo };
    }

    let documentQuery = Document.find(query);

    switch (sortBy) {
      case 'nameAsc':
        documentQuery = documentQuery.sort({ name: 1 });
        break;
      case 'nameDesc':
        documentQuery = documentQuery.sort({ name: -1 });
        break;
      case 'dateAsc':
        documentQuery = documentQuery.sort({ lastModified: 1 });
        break;
      case 'dateDesc':
        documentQuery = documentQuery.sort({ lastModified: -1 });
        break;
      case 'sizeAsc':
        documentQuery = documentQuery.sort({ size: 1 });
        break;
      case 'sizeDesc':
        documentQuery = documentQuery.sort({ size: -1 });
        break;
      default:
        documentQuery = documentQuery.sort({ lastModified: -1 });
    }

    const documents = await documentQuery.exec();
    console.log('Filtered documents:', documents); // Debug
    res.json(documents);
  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Update a document
router.put('/documents/:id', fetchuser, async (req, res) => {
  try {
    console.log('Updating document:', req.params.id, 'Updates:', req.body); // Debug
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updates = req.body;
    Object.assign(document, updates);
    document.lastModified = Date.now();
    await document.save();
    console.log('Updated document:', document); // Debug

    res.json({ success: true, document });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete a document and its file
router.delete('/documents/:id', fetchuser, async (req, res) => {
  try {
    console.log('Deleting document:', req.params.id, 'User:', req.user.id); // Debug
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    console.log('Deleting S3 object with key:', document.s3Key); // Debug
    await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: document.s3Key,
      })
      .promise();
    console.log('S3 object deleted successfully'); // Debug

    await document.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

// Download a document
router.get('/download/:id', fetchuser, async (req, res) => {
  try {
    console.log('Download request received for ID:', req.params.id, 'User:', req.user.id); // Debug
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });

    if (!document) {
      console.log('Document not found:', req.params.id); // Debug
      return res.status(404).json({ error: 'Document not found' });
    }

    // Generate a pre-signed URL for secure access
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: document.s3Key,
      Expires: 3600, // URL valid for 1 hour
    };
    console.log('Generating pre-signed URL with params:', params); // Debug
    const signedUrl = s3.getSignedUrl('getObject', params);
    console.log('Generated pre-signed URL:', signedUrl); // Debug

    res.json({ success: true, url: signedUrl });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to initiate download' });
  }
});

module.exports = router;