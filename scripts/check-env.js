#!/usr/bin/env node

/**
 * Environment Variable Checker
 * Run this before deploying to ensure all required variables are set
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment variables...\n');

// Backend environment variables
const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
const backendRequired = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME',
  'MONGODB_URI',
  'JWT_SECRET'
];

console.log('Backend Environment:');
if (fs.existsSync(backendEnvPath)) {
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf-8');
  const backendMissing = [];
  
  backendRequired.forEach(varName => {
    if (backendEnv.includes(`${varName}=`) && !backendEnv.includes(`${varName}=your-`)) {
      console.log(`  [OK] ${varName}`);
    } else {
      console.log(`  [MISSING] ${varName} - Missing or not set`);
      backendMissing.push(varName);
    }
  });
  
  if (backendMissing.length === 0) {
    console.log('  [OK] All backend variables configured!\n');
  } else {
    console.log(`  [WARNING] ${backendMissing.length} backend variable(s) need to be configured\n`);
  }
} else {
  console.log('  [MISSING] .env file not found in backend directory');
  console.log('  [INFO] Copy backend/.env.example to backend/.env and fill in values\n');
}

// Frontend environment variables
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
const frontendLocalPath = path.join(__dirname, '..', 'frontend', '.env.local');

console.log('🎨 Frontend Environment:');
if (fs.existsSync(frontendEnvPath) || fs.existsSync(frontendLocalPath)) {
  const frontendEnv = fs.readFileSync(
    fs.existsSync(frontendLocalPath) ? frontendLocalPath : frontendEnvPath,
    'utf-8'
  );
  
  if (frontendEnv.includes('REACT_APP_API_URL=')) {
    const apiUrl = frontendEnv.match(/REACT_APP_API_URL=(.*)/)?.[1]?.trim();
    if (apiUrl && apiUrl !== 'your-api-url' && !apiUrl.includes('undefined')) {
      console.log(`  [OK] REACT_APP_API_URL=${apiUrl}`);
    } else {
      console.log(`  [WARNING] REACT_APP_API_URL not properly configured`);
    }
  } else {
    console.log(`  [INFO] REACT_APP_API_URL not set (will use same-origin)`);
  }
} else {
  console.log('  [INFO] No .env file found (will use same-origin for API calls)');
  console.log('  💡 For separate frontend/backend deployment, create frontend/.env.local\n');
}

console.log('\n📋 Deployment Checklist:');
console.log('  □ Backend .env configured with AWS credentials');
console.log('  □ MongoDB URI set and accessible');
console.log('  □ S3 bucket CORS configured');
console.log('  □ Frontend REACT_APP_API_URL set (if deploying separately)');
console.log('  □ All dependencies installed (npm run install:all)');
console.log('  □ Frontend built (npm run build:frontend)');
console.log('\n💡 Run "npm run deploy:prepare" to build frontend for deployment\n');
