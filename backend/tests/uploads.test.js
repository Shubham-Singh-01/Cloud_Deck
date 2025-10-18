const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Document = require('../models/Document');
const uploadsRouter = require('../routes/uploads');
const authRouter = require('../routes/auth');
require('dotenv').config();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadsRouter);

// Simple File Upload Tests (Fresher-Friendly)
describe('File Upload Tests', () => {
  let authToken;
  let userId;
  let testDocumentId;

  const testUser = {
    name: 'Upload Test User',
    email: `uploadtest${Date.now()}@clouddeck.com`,
    password: 'uploadtest123'
  };

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clouddeck-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/createuser')
      .send(testUser);

    authToken = registerResponse.body.authtoken;
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    userId = decoded.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await Document.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });
    await mongoose.connection.close();
  });

  // Test 1: File Upload
  test('should upload file to AWS S3', async () => {
    const response = await request(app)
      .post('/api/uploads/upload')
      .set('auth-token', authToken)
      .field('folder', 'Test')
      .attach('files', Buffer.from('Test file'), 'test.txt');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.documents[0].s3Key).toBeDefined();
    
    testDocumentId = response.body.documents[0]._id;
    
    console.log('✓ File Upload to S3 Works');
  }, 15000);

  // Test 2: Authentication Required
  test('should require authentication', async () => {
    const response = await request(app)
      .post('/api/uploads/upload')
      .attach('files', Buffer.from('Test'), 'test.txt');

    expect(response.status).toBe(401);
    
    console.log('✓ Authentication Required');
  });

  // Test 3: Get Documents
  test('should get all documents', async () => {
    const response = await request(app)
      .get('/api/uploads/documents')
      .set('auth-token', authToken);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    console.log('✓ Get Documents Works');
  });

  // Test 4: Download File
  test('should generate download URL', async () => {
    const response = await request(app)
      .get(`/api/uploads/download/${testDocumentId}`)
      .set('auth-token', authToken);

    expect(response.status).toBe(200);
    expect(response.body.url).toBeDefined();
    expect(response.body.url).toContain('amazonaws.com');
    
    console.log('✓ Download URL Generation Works');
  }, 10000);

  // Test 5: Delete Document
  test('should delete document', async () => {
    const response = await request(app)
      .delete(`/api/uploads/documents/${testDocumentId}`)
      .set('auth-token', authToken);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    console.log('✓ Delete Document Works');
  }, 10000);
});

module.exports = { app };
