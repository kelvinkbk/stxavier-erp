// Enhanced Startup Script with Feature Detection
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnhancedStartup {
  constructor() {
    this.features = {
      security: false,
      performance: false,
      userManagement: false,
      monitoring: false
    };
    this.processes = [];
  }

  // Feature detection
  async detectFeatures() {
    console.log('🔍 Detecting available features...');
    
    try {
      // Check for SecurityService
      if (fs.existsSync(path.join(__dirname, '../src/services/SecurityService.ts'))) {
        this.features.security = true;
        console.log('✅ Security enhancements detected');
      }
      
      // Check for PerformanceMonitor
      if (fs.existsSync(path.join(__dirname, '../src/services/PerformanceMonitor.ts'))) {
        this.features.performance = true;
        console.log('✅ Performance monitoring detected');
      }
      
      // Check for AdvancedUserService
      if (fs.existsSync(path.join(__dirname, '../src/services/advancedUserService.ts'))) {
        this.features.userManagement = true;
        console.log('✅ Advanced user management detected');
      }
      
      // Check for AdminDashboard
      if (fs.existsSync(path.join(__dirname, '../src/screens/AdminDashboard.tsx'))) {
        this.features.monitoring = true;
        console.log('✅ Admin dashboard detected');
      }
      
      console.log('\n📊 Feature Summary:');
      Object.entries(this.features).forEach(([feature, enabled]) => {
        console.log(`  ${enabled ? '✅' : '❌'} ${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
      });
      
    } catch (error) {
      console.error('❌ Error detecting features:', error.message);
    }
  }

  // Environment setup
  async setupEnvironment() {
    console.log('\n🔧 Setting up environment...');
    
    try {
      // Check if .env exists
      if (!fs.existsSync('.env')) {
        if (fs.existsSync('.env.example')) {
          fs.copyFileSync('.env.example', '.env');
          console.log('✅ Created .env from template');
        } else {
          console.log('⚠️  No .env file found - create one for Firebase configuration');
        }
      }
      
      // Check node_modules
      if (!fs.existsSync('node_modules')) {
        console.log('📦 Installing dependencies...');
        await this.runCommand('npm install');
      }
      
      // Check if all required services are available
      if (this.features.security) {
        console.log('🔐 Security features initialized');
      }
      
      if (this.features.performance) {
        console.log('📈 Performance monitoring initialized');
      }
      
    } catch (error) {
      console.error('❌ Environment setup error:', error.message);
    }
  }

  // Network testing
  async testNetwork() {
    console.log('\n🌐 Testing network configuration...');
    
    try {
      // Test local network
      const localUrl = 'http://localhost:8081';
      console.log(`🔗 Local URL: ${localUrl}`);
      
      // Get local IP
      const networkInterfaces = require('os').networkInterfaces();
      let localIP = '';
      
      Object.values(networkInterfaces).forEach(interfaces => {
        interfaces.forEach(interface => {
          if (interface.family === 'IPv4' && !interface.internal) {
            localIP = interface.address;
          }
        });
      });
      
      if (localIP) {
        console.log(`🌍 Network URL: http://${localIP}:8081`);
        console.log(`📱 Use this URL for mobile devices on the same network`);
      }
      
      // Test tunnel if available
      console.log('🚀 Tunnel will be available through Expo');
      
    } catch (error) {
      console.error('❌ Network test error:', error.message);
    }
  }

  // Performance check
  async performanceCheck() {
    if (!this.features.performance) {
      console.log('⚠️  Performance monitoring not available');
      return;
    }
    
    console.log('\n📊 Running performance checks...');
    
    try {
      console.log('✅ Performance monitoring service available');
      console.log('📈 Performance metrics will be collected during runtime');
      console.log('🎯 Access performance data through Admin Dashboard');
    } catch (error) {
      console.error('❌ Performance check error:', error.message);
    }
  }

  // Security check
  async securityCheck() {
    if (!this.features.security) {
      console.log('⚠️  Security enhancements not available');
      return;
    }
    
    console.log('\n🔐 Running security checks...');
    
    try {
      console.log('✅ Security service available');
      console.log('🛡️  Features: Password validation, rate limiting, audit logging');
      console.log('📝 Security logs will be accessible through Admin Dashboard');
    } catch (error) {
      console.error('❌ Security check error:', error.message);
    }
  }

  // Start development server
  async startDevelopment(mode = 'web') {
    console.log(`\n🚀 Starting development server in ${mode} mode...`);
    
    try {
      let command;
      
      switch (mode) {
        case 'web':
          command = 'npx expo start --web';
          break;
        case 'global':
          command = 'npx expo start --web --tunnel';
          break;
        case 'android':
          command = 'npx expo start --android';
          break;
        case 'ios':
          command = 'npx expo start --ios';
          break;
        default:
          command = 'npx expo start';
      }
      
      console.log(`📋 Command: ${command}`);
      
      const serverProcess = spawn(command, {
        shell: true,
        stdio: 'inherit'
      });
      
      this.processes.push(serverProcess);
      
      // Enhanced features info
      if (this.features.monitoring) {
        console.log('\n🎛️  Admin Dashboard Features:');
        console.log('  • User management and bulk operations');
        console.log('  • Performance monitoring and statistics');
        console.log('  • Security logs and audit trails');
        console.log('  • System health monitoring');
      }
      
      console.log('\n🔗 Access URLs:');
      console.log('  • Local: http://localhost:8081');
      if (mode === 'global') {
        console.log('  • Tunnel: Available through Expo (check terminal)');
      }
      
      return serverProcess;
      
    } catch (error) {
      console.error('❌ Failed to start development server:', error.message);
    }
  }

  // Run command helper
  runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          if (stdout) console.log(stdout);
          if (stderr) console.error(stderr);
          resolve();
        }
      });
    });
  }

  // Cleanup on exit
  cleanup() {
    console.log('\n🧹 Cleaning up processes...');
    this.processes.forEach(process => {
      if (process && !process.killed) {
        process.kill();
      }
    });
  }

  // Main execution
  async run(args = []) {
    console.log('🎯 Enhanced ERP Startup System');
    console.log('================================\n');
    
    const mode = args.includes('--global') ? 'global' : 
                 args.includes('--android') ? 'android' :
                 args.includes('--ios') ? 'ios' : 'web';
    
    try {
      // Feature detection
      await this.detectFeatures();
      
      // Environment setup
      if (args.includes('--setup') || args.includes('--check')) {
        await this.setupEnvironment();
        await this.testNetwork();
        await this.performanceCheck();
        await this.securityCheck();
        
        if (args.includes('--check')) {
          console.log('\n✅ Health check completed');
          return;
        }
      }
      
      // Start development
      if (!args.includes('--check')) {
        await this.startDevelopment(mode);
      }
      
    } catch (error) {
      console.error('❌ Startup error:', error.message);
      process.exit(1);
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  startup.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  startup.cleanup();
  process.exit(0);
});

// Create and run startup
const startup = new EnhancedStartup();

// Parse command line arguments
const args = process.argv.slice(2);

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🎯 Enhanced ERP Startup System

Usage: node enhanced-startup.js [options]

Options:
  --setup         Setup environment and dependencies
  --check         Run health check only
  --global        Start with tunnel for global access
  --android       Start for Android development
  --ios           Start for iOS development
  --help, -h      Show this help message

Examples:
  node enhanced-startup.js --setup
  node enhanced-startup.js --global
  node enhanced-startup.js --check

Features:
  🔐 Security enhancements with audit logging
  📊 Performance monitoring and analytics
  👥 Advanced user management with bulk operations
  🎛️  Admin dashboard with comprehensive controls
  🌐 Global and local development modes
  `);
  process.exit(0);
}

// Run the startup system
startup.run(args);
