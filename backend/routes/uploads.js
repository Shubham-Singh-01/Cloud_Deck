const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const Folder = require('../models/Folder');
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
    const folder = req.body.folder || 'Uncategorized'; // Get folder from request body
    console.log('Uploading files for user:', userId, 'Files:', files.map(f => f.originalname), 'Folder:', folder); // Debug

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
        folder: folder, // Add folder to document
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
    console.log('=== DOWNLOAD REQUEST ===');
    console.log('Document ID:', req.params.id);
    console.log('User ID:', req.user.id);
    
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });

    if (!document) {
      console.log('[ERROR] Document not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Document not found' });
    }

    console.log('[SUCCESS] Document found:', document.name);
    console.log('S3 Key:', document.s3Key);

    // Generate a pre-signed URL for secure access from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: document.s3Key,
      Expires: 3600, // URL valid for 1 hour
      ResponseContentDisposition: `attachment; filename="${document.name}"`, // Force download with original filename
    };
    
    console.log('Generating pre-signed URL...');
    const signedUrl = s3.getSignedUrl('getObject', params);
    console.log('[SUCCESS] Pre-signed URL generated successfully');
    console.log('URL expires in 1 hour');
    console.log('=======================');

    res.json({ 
      success: true, 
      url: signedUrl,
      filename: document.name,
      size: document.size,
      type: document.type
    });
  } catch (err) {
    console.error('[ERROR] Download error:', err);
    res.status(500).json({ error: 'Failed to initiate download', details: err.message });
  }
});

// ===================== FOLDER MANAGEMENT ROUTES =====================

// Get all folders for a user
router.get('/folders', fetchuser, async (req, res) => {
  try {
    console.log('=== FETCHING FOLDERS FROM MONGODB ===');
    console.log('User ID:', req.user.id);
    
    // Fetch folders from MongoDB (permanent storage)
    const folders = await Folder.find({ user: req.user.id }).sort({ name: 1 });
    console.log(`Found ${folders.length} folders in MongoDB`);
    
    // Count documents in each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const count = await Document.countDocuments({ 
          user: req.user.id, 
          folder: folder.name 
        });
        return {
          ...folder.toObject(),
          count
        };
      })
    );
    
    console.log('Folders with counts:', foldersWithCount.map(f => `${f.name} (${f.count})`));
    console.log('====================================');
    res.json(foldersWithCount);
  } catch (err) {
    console.error('Fetch folders error:', err);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Create a new folder
router.post('/folders', fetchuser, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    console.log('=== CREATING FOLDER IN MONGODB ===');
    console.log('User ID:', req.user.id);
    console.log('Folder Name:', name);
    console.log('Will be saved to MongoDB permanently');
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Check if folder already exists
    const existingFolder = await Folder.findOne({ 
      user: req.user.id, 
      name: name.trim() 
    });
    
    if (existingFolder) {
      return res.status(400).json({ error: 'Folder with this name already exists' });
    }

    const folder = new Folder({
      user: req.user.id,
      name: name.trim(),
      description: description || '',
      color: color || '#3b82f6',
      icon: icon || 'folder',
    });

    // SAVE TO MONGODB PERMANENTLY
    await folder.save();
    console.log('[SUCCESS] Folder saved to MongoDB successfully!');
    console.log('Folder ID:', folder._id);
    console.log('===================================');
    
    res.json({ success: true, folder: { ...folder.toObject(), count: 0 } });
  } catch (err) {
    console.error('Create folder error:', err);
    if (err.code === 11000) {
      res.status(400).json({ error: 'Folder with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create folder' });
    }
  }
});

// Update a folder
router.put('/folders/:id', fetchuser, async (req, res) => {
  try {
    console.log('Updating folder:', req.params.id, 'Updates:', req.body); // Debug
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const oldName = folder.name;
    const { name, description, color, icon } = req.body;
    
    // If renaming, check for duplicates
    if (name && name.trim() !== oldName) {
      const existingFolder = await Folder.findOne({ 
        user: req.user.id, 
        name: name.trim() 
      });
      
      if (existingFolder) {
        return res.status(400).json({ error: 'Folder with this name already exists' });
      }
      
      // Update all documents in this folder
      await Document.updateMany(
        { user: req.user.id, folder: oldName },
        { folder: name.trim() }
      );
      
      folder.name = name.trim();
    }
    
    if (description !== undefined) folder.description = description;
    if (color) folder.color = color;
    if (icon) folder.icon = icon;
    folder.lastModified = Date.now();
    
    await folder.save();
    console.log('Updated folder:', folder); // Debug
    
    // Get document count
    const count = await Document.countDocuments({ 
      user: req.user.id, 
      folder: folder.name 
    });
    
    res.json({ success: true, folder: { ...folder.toObject(), count } });
  } catch (err) {
    console.error('Update folder error:', err);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete a folder
router.delete('/folders/:id', fetchuser, async (req, res) => {
  try {
    console.log('Deleting folder:', req.params.id, 'User:', req.user.id); // Debug
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Move all documents in this folder to "Uncategorized"
    await Document.updateMany(
      { user: req.user.id, folder: folder.name },
      { folder: 'Uncategorized' }
    );

    await folder.deleteOne();
    console.log('Deleted folder:', folder.name); // Debug
    
    res.json({ success: true, message: 'Folder deleted' });
  } catch (err) {
    console.error('Delete folder error:', err);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// ===================== STORAGE INFORMATION ROUTE =====================

// Get S3 storage usage for the user
router.get('/storage', fetchuser, async (req, res) => {
  try {
    console.log('Fetching storage info for user:', req.user.id); // Debug
    
    // Get all user documents
    const documents = await Document.find({ user: req.user.id });
    
    // Calculate total size in bytes
    let totalBytes = 0;
    documents.forEach(doc => {
      // Parse size string like "1.5 MB" to bytes
      const sizeMatch = doc.size.match(/^([\d.]+)\s*(KB|MB|GB)$/i);
      if (sizeMatch) {
        const value = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2].toUpperCase();
        
        switch (unit) {
          case 'KB':
            totalBytes += value * 1024;
            break;
          case 'MB':
            totalBytes += value * 1024 * 1024;
            break;
          case 'GB':
            totalBytes += value * 1024 * 1024 * 1024;
            break;
        }
      }
    });
    
    // Get S3 bucket info (optional - this gives total bucket size, not just user's files)
    let bucketTotalSize = 0;
    try {
      const listParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
      };
      
      const listedObjects = await s3.listObjectsV2(listParams).promise();
      if (listedObjects.Contents) {
        bucketTotalSize = listedObjects.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
      }
    } catch (s3Error) {
      console.warn('Could not fetch S3 bucket info:', s3Error.message);
    }
    
    // Format sizes
    const formatSize = (bytes) => {
      if (bytes === 0) return { value: 0, unit: 'GB', formatted: '0 GB' };
      
      const kb = bytes / 1024;
      const mb = kb / 1024;
      const gb = mb / 1024;
      
      if (gb >= 1) {
        return { value: gb, unit: 'GB', formatted: `${gb.toFixed(2)} GB` };
      } else if (mb >= 1) {
        return { value: mb, unit: 'MB', formatted: `${mb.toFixed(2)} MB` };
      } else if (kb >= 1) {
        return { value: kb, unit: 'KB', formatted: `${kb.toFixed(2)} KB` };
      } else {
        return { value: bytes, unit: 'B', formatted: `${bytes} B` };
      }
    };
    
    const userStorage = formatSize(totalBytes);
    const bucketStorage = formatSize(bucketTotalSize);
    
    // Set a quota limit to 5 GB per user
    const quotaBytes = 5 * 1024 * 1024 * 1024; // 5 GB
    const quotaStorage = formatSize(quotaBytes);
    const percentageUsed = (totalBytes / quotaBytes * 100).toFixed(2);
    
    console.log('Storage info:', { 
      userStorage, 
      bucketStorage, 
      quotaStorage, 
      percentageUsed,
      fileCount: documents.length 
    }); // Debug
    
    res.json({
      success: true,
      storage: {
        used: userStorage,
        quota: quotaStorage,
        percentageUsed: parseFloat(percentageUsed),
        bucketTotal: bucketStorage,
        fileCount: documents.length,
        usedBytes: totalBytes,
        quotaBytes: quotaBytes,
      }
    });
  } catch (err) {
    console.error('Storage info error:', err);
    res.status(500).json({ error: 'Failed to fetch storage information' });
  }
});

module.exports = router;