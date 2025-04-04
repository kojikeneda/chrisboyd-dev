#!/usr/bin/env node

const { spawn } = require('child_process');
const { execSync } = require('child_process');

// Function to check if a port is in use
function isPortInUse(port) {
  try {
    execSync(`lsof -i:${port}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Kill any existing processes
console.log('Cleaning up existing processes...');
try { execSync('pkill -f "hugo server" || true', { stdio: 'ignore' }); } catch (e) {}
try { execSync('pkill -f "go run.*telemetry-service/main.go" || true', { stdio: 'ignore' }); } catch (e) {}

// Kill processes on specific ports
[8080, 1313].forEach(port => {
  if (isPortInUse(port)) {
    try { 
      const pid = execSync(`lsof -t -i:${port}`).toString().trim();
      console.log(`Killing process on port ${port} (PID: ${pid})`);
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' }); 
    } catch (e) {}
  }
});

// Small delay to ensure processes are fully terminated
setTimeout(() => {
  console.log('Starting local development environment...');
  
  // Start dev.sh in a detached process so it continues running after this script exits
  const child = spawn('./dev.sh', [], {
    detached: true,
    stdio: 'ignore',
    cwd: process.cwd(),
  });
  
  // Unref the child to allow this script to exit
  child.unref();
  
  console.log('Development environment started in the background.');
  console.log('Waiting for services to initialize...');
  
  // Check if Hugo is running after a delay
  setTimeout(() => {
    if (isPortInUse(1313) && isPortInUse(8080)) {
      console.log('🟢 Local development environment is running!');
      console.log('   Hugo: http://localhost:1313');
      console.log('   Telemetry Service: http://localhost:8080');
    } else {
      console.log('⚠️  Warning: Not all services appear to be running.');
      console.log('   Run "npm run dev:logs" to check for errors.');
    }
    
    // Exit the script
    process.exit(0);
  }, 5000);
}, 1000); 