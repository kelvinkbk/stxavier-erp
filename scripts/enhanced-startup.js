#!/usr/bin/env node

/**
 * Enhanced Startup Script for St. Xavier ERP
 * Comprehensive startup with diagnostics and optimization
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnhancedStartup {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📘',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type] || '📘';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async checkEnvironment() {
    this.log('Checking development environment...', 'info');

    // Check package.json
    if (fs.existsSync('package.json')) {
      this.checks.push('package.json exists');
      this.log('Package configuration found', 'success');
    } else {
      this.errors.push('package.json not found');
      this.log('Package configuration missing', 'error');
    }

    // Check node_modules
    if (fs.existsSync('node_modules')) {
      this.checks.push('Dependencies installed');
      this.log('Dependencies are installed', 'success');
    } else {
      this.warnings.push('Dependencies may need installation');
      this.log('Dependencies might be missing - run npm install', 'warning');
    }

    // Check .env file
    if (fs.existsSync('.env')) {
      this.checks.push('Environment configuration found');
      this.log('Environment variables configured', 'success');
    } else {
      this.warnings.push('No .env file found');
      this.log('Environment variables not configured (using defaults)', 'warning');
    }

    return this.errors.length === 0;
  }

  async startDevelopmentServer() {
    this.log('Starting enhanced development server...', 'info');

    return new Promise((resolve, reject) => {
      const expo = spawn('npx', ['expo', 'start', '--tunnel'], {
        stdio: 'inherit',
        shell: true
      });

      expo.on('error', (error) => {
        this.log(`Failed to start server: ${error.message}`, 'error');
        reject(error);
      });

      expo.on('close', (code) => {
        this.log(`Development server exited with code ${code}`, 'info');
        resolve(code);
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        this.log('Shutting down development server...', 'info');
        expo.kill('SIGINT');
      });
    });
  }

  async printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 ST. XAVIER ERP - STARTUP SUMMARY');
    console.log('='.repeat(50));

    if (this.checks.length > 0) {
      console.log(`\n✅ Checks Passed (${this.checks.length}):`);
      this.checks.forEach(check => console.log(`   • ${check}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    console.log('\n🚀 Development server is starting...\n');
  }

  async run() {
    console.log('🎓 St. Xavier ERP - Enhanced Startup');
    console.log('====================================\n');

    try {
      const environmentOk = await this.checkEnvironment();
      await this.printSummary();

      if (environmentOk) {
        await this.startDevelopmentServer();
      } else {
        this.log('Environment check failed. Please fix errors and try again.', 'error');
        process.exit(1);
      }
    } catch (error) {
      this.log(`Startup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the enhanced startup
const startup = new EnhancedStartup();
startup.run();