#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 OpenTok PWA Deployment Script');
console.log('================================\n');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env file not found.');
  console.log('   Please create a .env file with the following variables:');
  console.log('   VITE_SUPABASE_URL=your_supabase_url');
  console.log('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key\n');
}

// Check if required environment variables are set
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_VAPID_PUBLIC_KEY'
];

console.log('🔍 Checking environment variables...');
let missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n   Please set these variables before deploying.\n');
}

// Build the application
console.log('🔨 Building OpenTok PWA...');
try {
  execSync('npm run build:pwa', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist directory not found after build.');
  process.exit(1);
}

// Check for required PWA files
const requiredFiles = [
  'index.html',
  'manifest.json',
  'sw.js',
  'offline.html'
];

console.log('🔍 Checking PWA files...');
let missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log('⚠️  Missing PWA files:');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log('\n   PWA features may not work correctly.\n');
} else {
  console.log('✅ All PWA files found!\n');
}

// Check for icons
const iconsPath = path.join(distPath, 'icons');
if (fs.existsSync(iconsPath)) {
  const iconFiles = fs.readdirSync(iconsPath);
  console.log(`✅ Found ${iconFiles.length} icon files\n`);
} else {
  console.log('⚠️  Warning: Icons directory not found\n');
}

// Deployment instructions
console.log('📋 Deployment Instructions:');
console.log('==========================');
console.log('1. Go to https://dashboard.render.com');
console.log('2. Click "New +" → "Static Site"');
console.log('3. Connect your GitHub repository');
console.log('4. Configure build settings:');
console.log('   - Build Command: npm ci && npm run build:pwa');
console.log('   - Publish Directory: dist');
console.log('5. Add environment variables:');
console.log('   - VITE_SUPABASE_URL');
console.log('   - VITE_SUPABASE_ANON_KEY');
console.log('   - VITE_VAPID_PUBLIC_KEY');
console.log('6. Add custom headers (see DEPLOYMENT.md)');
console.log('7. Deploy! 🚀\n');

console.log('📚 For detailed instructions, see DEPLOYMENT.md');
console.log('🎉 Your OpenTok PWA is ready for deployment!');
