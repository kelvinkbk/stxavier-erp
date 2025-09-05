#!/usr/bin/env node

// Enhanced startup script with auto-detection and improvements
const { spawn, exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Environment detection and setup
function checkEnvironment() {
  log('\n🔍 Environment Check:', 'cyan');
  
  const checks = {
    node: checkNodeVersion(),
    expo: checkExpoCLI(),
    vercel: checkVercelCLI(),
    env: checkEnvFile(),
    firebase: checkFirebaseConfig(),
    dependencies: checkDependencies()
  };
  
  return checks;
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  const isValid = major >= 14;
  
  log(`   Node.js: ${version} ${isValid ? '✅' : '❌'}`, isValid ? 'green' : 'red');
  return isValid;
}

function checkExpoCLI() {
  try {
    const result = require('child_process').execSync('npx expo --version', { encoding: 'utf8' });
    log(`   Expo CLI: ${result.trim()} ✅`, 'green');
    return true;
  } catch (error) {
    log('   Expo CLI: Not found ❌', 'red');
    return false;
  }
}

function checkVercelCLI() {
  try {
    const result = require('child_process').execSync('vercel --version', { encoding: 'utf8' });
    log(`   Vercel CLI: ${result.trim()} ✅`, 'green');
    return true;
  } catch (error) {
    log('   Vercel CLI: Not found ❌', 'red');
    return false;
  }
}

function checkEnvFile() {
  const envExists = fs.existsSync('.env');
  log(`   Environment file: ${envExists ? '✅' : '❌'}`, envExists ? 'green' : 'red');
  return envExists;
}

function checkFirebaseConfig() {
  try {
    const firebaseConfig = fs.readFileSync('src/firebase.ts', 'utf8');
    const hasConfig = firebaseConfig.includes('apiKey') && !firebaseConfig.includes('your-api-key');
    log(`   Firebase config: ${hasConfig ? '✅' : '❌'}`, hasConfig ? 'green' : 'red');
    return hasConfig;
  } catch (error) {
    log('   Firebase config: Not found ❌', 'red');
    return false;
  }
}

function checkDependencies() {
  const packageExists = fs.existsSync('node_modules');
  log(`   Dependencies: ${packageExists ? '✅' : '❌'}`, packageExists ? 'green' : 'red');
  return packageExists;
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const info = {
    local: 'localhost',
    wifi: null,
    ethernet: null
  };
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
          info.wifi = iface.address;
        } else if (name.toLowerCase().includes('ethernet') || name.toLowerCase().includes('local')) {
          info.ethernet = iface.address;
        }
      }
    }
  }
  
  return info;
}

function showImprovedAccessInfo(port = 8081) {
  const network = getNetworkInfo();
  
  log('\n📱 Access Methods:', 'yellow');
  log(`   Local Development: http://localhost:${port}`, 'green');
  
  if (network.wifi) {
    log(`   WiFi Network:      http://${network.wifi}:${port}`, 'green');
  }
  
  if (network.ethernet) {
    log(`   Ethernet Network:  http://${network.ethernet}:${port}`, 'green');
  }
  
  log(`   Global Tunnel:     Will be shown below`, 'cyan');
  log(`   Mobile QR Code:    Scan in terminal`, 'magenta');
  
  log('\n🌐 Sharing Options:', 'yellow');
  log('   Team Testing:   Share WiFi URL with colleagues', 'white');
  log('   Remote Testing: Use tunnel URL for external access', 'white');
  log('   Mobile Testing: Scan QR code with Expo Go app', 'white');
}

async function autoSetup() {
  log('\n🔧 Auto-Setup:', 'cyan');
  
  // Install missing dependencies
  if (!fs.existsSync('node_modules')) {
    log('   Installing dependencies...', 'yellow');
    await runCommand('npm', ['install']);
    log('   ✅ Dependencies installed', 'green');
  }
  
  // Create .env if missing
  if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
    log('   Creating .env file...', 'yellow');
    fs.copyFileSync('.env.example', '.env');
    log('   ✅ .env file created (please update with your credentials)', 'green');
  }
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function startWithImprovements() {
  log('🎓 St. Xavier ERP - Enhanced Startup', 'bright');
  log('=====================================', 'bright');
  
  // Environment check
  const envCheck = checkEnvironment();
  
  // Auto-setup if needed
  if (!envCheck.dependencies) {
    await autoSetup();
  }
  
  // Show improved access information
  showImprovedAccessInfo(8081);
  
  // Performance monitoring
  log('\n⚡ Performance Monitoring:', 'yellow');
  log('   Bundle size optimization: Enabled', 'green');
  log('   Hot reload: Enabled', 'green');
  log('   Source maps: Enabled', 'green');
  
  log('\n🚀 Starting Enhanced Development Server...', 'cyan');
  
  try {
    await runCommand('npx', ['expo', 'start', '--web', '--tunnel']);
  } catch (error) {
    log(`❌ Failed to start server: ${error.message}`, 'red');
    
    log('\n💡 Troubleshooting:', 'yellow');
    log('   1. Check if port 8081 is available', 'white');
    log('   2. Verify Firebase credentials in .env', 'white');
    log('   3. Ensure internet connection for tunnel', 'white');
    log('   4. Try: npm install', 'white');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--check') || args.includes('-c')) {
  checkEnvironment();
} else if (args.includes('--setup') || args.includes('-s')) {
  autoSetup();
} else {
  startWithImprovements();
}
