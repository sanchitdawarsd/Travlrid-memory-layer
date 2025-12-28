require('dotenv').config();

console.log('\n🔍 Checking Email Scraper Setup...\n');

const requiredEnvVars = {
  'PORT': process.env.PORT,
  'GMAIL_CLIENT_ID': process.env.GMAIL_CLIENT_ID,
  'GMAIL_CLIENT_SECRET': process.env.GMAIL_CLIENT_SECRET,
  'GMAIL_REDIRECT_URI': process.env.GMAIL_REDIRECT_URI,
  'OUTLOOK_CLIENT_ID': process.env.OUTLOOK_CLIENT_ID,
  'OUTLOOK_CLIENT_SECRET': process.env.OUTLOOK_CLIENT_SECRET,
  'OUTLOOK_REDIRECT_URI': process.env.OUTLOOK_REDIRECT_URI,
  'SESSION_SECRET': process.env.SESSION_SECRET,
  'CLIENT_URL': process.env.CLIENT_URL,
};

let allValid = true;
let warnings = [];

console.log('Environment Variables Check:\n');

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value || value.includes('your_') || value.includes('_here')) {
    console.log(`❌ ${key}: Missing or not configured`);
    allValid = false;
  } else {
    console.log(`✅ ${key}: Configured`);
  }
});

console.log('\n' + '='.repeat(50) + '\n');

if (allValid) {
  console.log('✅ All environment variables are configured!\n');
  console.log('You can start the application with:');
  console.log('  npm run dev\n');
} else {
  console.log('❌ Some environment variables are missing or not configured.\n');
  console.log('Please follow these steps:\n');
  console.log('1. Copy .env.example to .env');
  console.log('   cp .env.example .env\n');
  console.log('2. Follow SETUP_GUIDE.md to get OAuth credentials\n');
  console.log('3. Edit .env and add your credentials\n');
  console.log('4. Run this check again: node server/checkSetup.js\n');
  process.exit(1);
}

// Check if dependencies are installed
const fs = require('fs');
const path = require('path');

console.log('Dependency Check:\n');

const nodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
const clientNodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'client', 'node_modules'));

if (nodeModulesExists) {
  console.log('✅ Backend dependencies installed');
} else {
  console.log('❌ Backend dependencies not installed');
  console.log('   Run: npm install\n');
  allValid = false;
}

if (clientNodeModulesExists) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('❌ Frontend dependencies not installed');
  console.log('   Run: cd client && npm install\n');
  allValid = false;
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('\n✅ Created data directory for storing bookings');
} else {
  console.log('\n✅ Data directory exists');
}

console.log('\n' + '='.repeat(50) + '\n');

if (allValid) {
  console.log('🚀 Setup complete! Ready to run.\n');
} else {
  console.log('⚠️  Please complete the setup steps above.\n');
  process.exit(1);
}

