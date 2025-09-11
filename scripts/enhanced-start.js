#!/usr/bin/env node

/**
 * Enhanced Start Script for St. Xavier ERP
 * Provides better startup experience with health checks
 */

const { spawn } = require('child_process');
const os = require('os');

console.log('🎓 St. Xavier ERP - Enhanced Start');
console.log('==================================');
console.log('');

// Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

if (parseInt(nodeVersion.slice(1)) < 16) {
  console.warn('⚠️  Warning: Node.js 16+ is recommended for best performance');
}

// Check platform
const platform = os.platform();
const arch = os.arch();
console.log(`💻 Platform: ${platform} (${arch})`);
console.log('');

// Start the development server
console.log('🚀 Starting Expo development server...');
console.log('');

const expo = spawn('npx', ['expo', 'start'], {
  stdio: 'inherit',
  shell: true
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error.message);
  process.exit(1);
});

expo.on('close', (code) => {
  console.log(`\n📊 Expo process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  expo.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  expo.kill('SIGTERM');
});