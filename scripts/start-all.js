#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');
const path = require('path');

// Colors for console output
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

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
      if (options.showOutput) {
        console.log(data.toString());
      }
    });

    process.stderr.on('data', (data) => {
      output += data.toString();
      if (options.showOutput) {
        console.error(data.toString());
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    // Return the process so we can kill it later if needed
    return process;
  });
}

async function startExpoServer() {
  log('🚀 Starting Expo Development Server...', 'cyan');
  
  const expoProcess = spawn('npx', ['expo', 'start', '--web'], {
    stdio: 'pipe',
    shell: true,
    detached: false
  });

  return new Promise((resolve) => {
    expoProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Check if server is ready
      if (output.includes('Web is waiting on') || output.includes('Metro waiting on')) {
        resolve(expoProcess);
      }
    });

    expoProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}

async function main() {
  const localIP = getLocalIP();
  const webPort = 8081;
  const webUrl = `http://${localIP}:${webPort}`;
  
  log('🎓 St. Xavier ERP - All-in-One Startup Script', 'bright');
  log('================================================', 'bright');
  
  // Display all access methods
  log('\n📱 Access Methods:', 'yellow');
  log(`   Local Web:     http://localhost:${webPort}`, 'green');
  log(`   Network Web:   ${webUrl}`, 'green');
  log(`   Mobile QR:     Scan QR code in terminal`, 'green');
  log(`   Expo URL:      Will be shown below`, 'green');
  
  log('\n🌐 Cross-Network Testing:', 'yellow');
  log(`   Same WiFi:     ${webUrl}`, 'cyan');
  log(`   Mobile App:    Use QR code or Expo URL`, 'cyan');
  
  try {
    // Start Expo server
    const expoProcess = await startExpoServer();
    
    log('\n✅ Expo Server Started Successfully!', 'green');
    log('\n📋 Next Steps:', 'yellow');
    log('   1. Open web browser: ' + webUrl, 'white');
    log('   2. Scan QR code with Expo Go app for mobile testing', 'white');
    log('   3. Share the network URL with others on same WiFi', 'white');
    log('   4. Press Ctrl+C to stop all services', 'white');
    
    log('\n🔧 Available Commands While Running:', 'yellow');
    log('   Press "w" - Open web browser', 'white');
    log('   Press "a" - Open Android emulator', 'white');
    log('   Press "i" - Open iOS simulator', 'white');
    log('   Press "r" - Reload app', 'white');
    
    // Handle process termination
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down services...', 'red');
      expoProcess.kill();
      process.exit(0);
    });
    
    // Keep the script running
    await new Promise(() => {});
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Add deployment function
async function deploy() {
  log('\n🚀 Starting Deployment Process...', 'cyan');
  
  try {
    log('📦 Building web version...', 'yellow');
    await runCommand('npm', ['run', 'build:web'], { showOutput: true });
    
    log('☁️ Deploying to Vercel...', 'yellow');
    const deployOutput = await runCommand('vercel', ['--prod'], { showOutput: true });
    
    log('✅ Deployment completed!', 'green');
    log('🌐 Your app is now available globally!', 'green');
    
  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'red');
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--deploy') || args.includes('-d')) {
  deploy();
} else {
  main();
}
