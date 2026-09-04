const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env');
const exampleFile = path.join(__dirname, '.env.example');

if (fs.existsSync(envFile)) {
  console.log('server/.env already exists - leaving it as-is.');
} else {
  fs.copyFileSync(exampleFile, envFile);
  console.log('Created server/.env from .env.example.');
  console.log('  Optional: set MONGODB_URI, JWT_SECRET, and API keys there if you have them.');
  console.log('  Defaults let the app run locally with MongoDB on 127.0.0.1:27017.');
}

console.log('\nNext steps:');
console.log('  1. Install deps:   npm install');
console.log('  2. Start Mongo:    make sure MongoDB is running on 127.0.0.1:27017 (or set MONGODB_URI in server/.env)');
console.log('  3. Seed data:      npm run seed');
console.log('  4. Start server:   npm run dev   (API on http://localhost:5000)\n');
