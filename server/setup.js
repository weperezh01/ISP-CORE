#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 WellNet Backend Setup Script');
console.log('==================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📋 Creating .env file from .env.example...');
    fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
    console.log('✅ .env file created');
    console.log('⚠️  Please edit .env file with your database credentials\n');
} else {
    console.log('✅ .env file already exists\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
exec('npm install', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Error installing dependencies:', error);
        return;
    }
    
    console.log('✅ Dependencies installed successfully\n');
    
    // Display next steps
    console.log('🎯 Next Steps:');
    console.log('==============');
    console.log('1. Edit the .env file with your database credentials');
    console.log('2. Create MySQL database: CREATE DATABASE wellnet_db;');
    console.log('3. Import schema: mysql -u username -p wellnet_db < database/schema.sql');
    console.log('4. Start server: npm run dev');
    console.log('\n🌐 Server will run on: http://localhost:444');
    console.log('📊 Endpoints will be available at: http://localhost:444/api/accounting/*');
    console.log('\n🔗 Test health endpoint:');
    console.log('curl http://localhost:444/health');
    
    console.log('\n🚨 URGENT: Update your React Native app API base URL to point to this server!');
});

console.log('Running npm install...\n');