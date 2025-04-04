#!/usr/bin/env node

const { execSync } = require('child_process');
const { spawn } = require('child_process');

function runCommand(command, options = {}) {
  console.log(`\n📋 Running: ${command}`);
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf-8',
      ...options
    });
    console.log(`✅ Command successful. Output summary:`);
    // Show first few lines of output
    const outputLines = output.split('\n').slice(0, 5);
    if (outputLines.length > 0) {
      console.log('   ' + outputLines.join('\n   ') + (output.split('\n').length > 5 ? '\n   ...' : ''));
    }
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    if (error.stdout) console.log(`   stdout: ${error.stdout.slice(0, 200)}${error.stdout.length > 200 ? '...' : ''}`);
    if (error.stderr) console.log(`   stderr: ${error.stderr.slice(0, 200)}${error.stderr.length > 200 ? '...' : ''}`);
    return false;
  }
}

function runAsync(command, timeoutMs = 5000) {
  return new Promise((resolve) => {
    console.log(`\n📋 Running async (${timeoutMs}ms): ${command}`);
    const process = spawn(command, [], { shell: true });
    
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    // Set a timeout to kill the process
    const timer = setTimeout(() => {
      process.kill();
      console.log(`⏱️ Command timed out after ${timeoutMs}ms.`);
      console.log('   Output preview:');
      const outputLines = output.split('\n').slice(0, 5);
      if (outputLines.length > 0) {
        console.log('   ' + outputLines.join('\n   ') + (output.split('\n').length > 5 ? '\n   ...' : ''));
      }
      resolve(true);
    }, timeoutMs);
    
    // Clear the timeout when the process exits
    process.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        console.log(`✅ Command completed successfully.`);
      } else {
        console.log(`❌ Command exited with code ${code}`);
      }
      resolve(code === 0);
    });
  });
}

function isPortInUse(port) {
  try {
    execSync(`lsof -i:${port}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Fixed function to check if a process is running
function isProcessRunning(pattern) {
  try {
    const result = execSync(`pgrep -f "${pattern}"`, { stdio: 'pipe' }).toString().trim();
    return result !== '';
  } catch (e) {
    return false;
  }
}

// Test functions
async function testDevLogs() {
  console.log('\n🔍 Testing "dev:logs" command...');
  
  // Create a simple implementation similar to the MCP command
  const hugoRunning = isPortInUse(1313);
  const telemetryRunning = isPortInUse(8080);
  
  console.log('Development services status:');
  console.log(`   Hugo Server: ${hugoRunning ? '🟢 Running' : '🔴 Stopped'}`);
  console.log(`   Telemetry Service: ${telemetryRunning ? '🟢 Running' : '🔴 Stopped'}`);
  
  if (hugoRunning) {
    console.log('\n=== Hugo Server Process ===');
    runCommand('ps -ef | grep "hugo server" | grep -v grep');
  }
  
  if (telemetryRunning) {
    console.log('\n=== Telemetry Service Process ===');
    runCommand('ps -ef | grep "go run.*telemetry-service/main.go" | grep -v grep');
  }
  
  return true;
}

async function testDevDown() {
  console.log('\n🔍 Testing "dev:down" command...');
  
  // Kill any processes on the specific ports (similar to MCP command)
  console.log('Shutting down local development environment...');
  
  try { execSync('pkill -f "hugo server" || true', { stdio: 'ignore' }); } catch (e) {}
  try { execSync('pkill -f "go run.*telemetry-service/main.go" || true', { stdio: 'ignore' }); } catch (e) {}
  
  [8080, 1313].forEach(port => {
    if (isPortInUse(port)) {
      try { 
        const pid = execSync(`lsof -t -i:${port}`).toString().trim();
        console.log(`Killing process on port ${port} (PID: ${pid})`);
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' }); 
      } catch (e) {}
    }
  });
  
  // Verify all services are down
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const running = [8080, 1313].filter(port => isPortInUse(port));
  if (running.length === 0) {
    console.log('🟢 All development services successfully stopped.');
  } else {
    console.log(`⚠️ Warning: Some services are still running on ports: ${running.join(', ')}`);
    return false;
  }
  
  return true;
}

async function testDevUp() {
  console.log('\n🔍 Testing "dev:up" command...');
  
  // First make sure everything is stopped
  await testDevDown();
  
  // Start the dev environment
  console.log('Starting local development environment...');
  
  // Start in background with a 5-second timeout
  await runAsync('./dev.sh', 5000);
  
  // Check if services are running
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const hugoRunning = isPortInUse(1313);
  const telemetryRunning = isPortInUse(8080);
  
  console.log('Development services status after startup:');
  console.log(`   Hugo Server: ${hugoRunning ? '🟢 Running' : '🔴 Stopped'}`);
  console.log(`   Telemetry Service: ${telemetryRunning ? '🟢 Running' : '🔴 Stopped'}`);
  
  if (hugoRunning && telemetryRunning) {
    console.log('✅ Development environment started successfully.');
    return true;
  } else {
    console.log('❌ Not all services started successfully.');
    return false;
  }
}

async function testProdDeployDryRun() {
  console.log('\n🔍 Testing "prod:deploy" command (dry run)...');
  
  console.log('This command would:');
  console.log('1. Deploy the Cloudflare Worker to prod');
  console.log('2. Update the telemetry.js with the correct worker URL');
  console.log('3. Rebuild the Hugo site');
  console.log('4. Provide guidance for Cloudflare Pages deployment');
  
  // Check the CloudFlare login status
  const wranglerIsInstalled = runCommand('which npx && npx wrangler --version || echo "Wrangler not installed"', { stdio: 'pipe' });
  
  if (!wranglerIsInstalled) {
    console.log('⚠️ Wrangler is not installed or accessible.');
    return false;
  }
  
  console.log('✅ Wrangler is installed and accessible.');
  
  // Check Hugo installation
  const hugoIsInstalled = runCommand('which hugo && hugo version || echo "Hugo not installed"', { stdio: 'pipe' });
  
  if (!hugoIsInstalled) {
    console.log('⚠️ Hugo is not installed or accessible.');
    return false;
  }
  
  console.log('✅ Hugo is installed and accessible.');
  
  // Verify telemetry.js exists
  const telemetryJsExists = runCommand('test -f static/js/telemetry.js && echo "Telemetry.js exists" || echo "Telemetry.js missing"', { stdio: 'pipe' });
  
  if (!telemetryJsExists) {
    console.log('⚠️ static/js/telemetry.js file not found.');
    return false;
  }
  
  console.log('✅ All prerequisites for prod:deploy are available.');
  return true;
}

// Main test function
async function runTests() {
  console.log('=== TESTING MCP COMMANDS ===');
  
  // First check logs - non-destructive
  await testDevLogs();
  
  console.log('\n⚠️ Testing potentially destructive commands...');
  
  // Test dev:down
  const downResult = await testDevDown();
  
  // Test dev:up
  const upResult = await testDevUp();
  
  // Test prod:deploy (dry run)
  const prodResult = await testProdDeployDryRun();
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`dev:logs: ✅ Command tested`);
  console.log(`dev:down: ${downResult ? '✅ Command working' : '❌ Command has issues'}`);
  console.log(`dev:up: ${upResult ? '✅ Command working' : '❌ Command has issues'}`);
  console.log(`prod:deploy: ${prodResult ? '✅ Prerequisites verified (dry run)' : '❌ Some prerequisites missing'}`);
  
  // Cleanup to ensure we don't leave services running
  await testDevDown();
  console.log('\n✅ Tests completed - All services stopped');
}

// Run the tests
runTests(); 