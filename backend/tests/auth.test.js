const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authRouter = require('../routes/auth');
require('dotenv').config();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Simple Authentication Tests (Fresher-Friendly)
describe('Authentication Tests', () => {
  let testUser = {
    name: 'Test User',
    email: `test${Date.now()}@test.com`,
    password: 'test1234'
  };

  beforeAll(async () => {
    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clouddeck-test');
    }
  });

  afterAll(async () => {
    // Clean up
    await User.deleteOne({ email: testUser.email });
    await mongoose.connection.close();
  });

  // Test 1: User Registration
  test('should create new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/createuser')
      .send(testUser);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.authtoken).toBeDefined();
    
    console.log('✓ User Registration Works');
  });

  // Test 2: Duplicate Email Check
  test('should not allow duplicate emails', async () => {
    const response = await request(app)
      .post('/api/auth/createuser')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('already exists');
    
    console.log('✓ Duplicate Email Prevention Works');
  });

  // Test 3: User Login
  test('should login user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.authtoken).toBeDefined();
    
    console.log('✓ User Login Works');
  });

  // Test 4: Wrong Password
  test('should reject wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(400);
    
    console.log('✓ Wrong Password Rejected');
  });

  // Test 5: JWT Token Check
  test('should generate valid JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const token = response.body.authtoken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    expect(decoded.user).toBeDefined();
    expect(decoded.user.id).toBeDefined();
    
    console.log('✓ JWT Token Valid');
  });
});

module.exports = { app };
