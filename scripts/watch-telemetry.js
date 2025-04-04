#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BLUE = '\x1b[34m';

console.log(`${BLUE}=== TELEMETRY MONITOR ===\n${RESET}`);

// Create a temp file for the logs
const tempLogFile = path.join(os.tmpdir(), 'telemetry-monitor.log');

// Keep track of what we've already seen
let lastPosition = 0;

function runTailCommand() {
  try {
    // Run nohup in background to avoid freezing the terminal
    execSync(`ps aux | grep "go run.*telemetry-service/main.go" | grep -v grep`, { stdio: 'pipe' });
    console.log(`${GREEN}✓ Telemetry service is running${RESET}`);
  } catch (e) {
    console.log(`${RED}✗ Telemetry service is not running${RESET}`);
    process.exit(1);
  }

  try {
    // Get the process ID of the telemetry service
    const pid = execSync(`pgrep -f "go run.*telemetry-service/main.go"`, { encoding: 'utf-8' }).trim();
    console.log(`${BLUE}ℹ Telemetry service PID: ${pid}${RESET}`);

    // Check for network connections
    const netstat = execSync(`lsof -p ${pid} -i -n -P`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`${BLUE}ℹ Network connections:${RESET}`);
    console.log(netstat);
  } catch (e) {
    console.log(`${YELLOW}⚠ Could not get detailed telemetry process info${RESET}`);
  }

  // Attach to output of running dev.sh process
  console.log(`${BLUE}ℹ Attaching to telemetry logs...${RESET}`);
  console.log(`${YELLOW}(Press Ctrl+C to stop monitoring)${RESET}\n`);

  // Start monitoring the logs
  setInterval(() => {
    try {
      // Get any new logs
      execSync(`ps aux | grep "go run.*telemetry-service/main.go" | grep -v grep | awk '{print $2}' | xargs -I{} sh -c 'ps -p {} -o command= 2>/dev/null'`, { encoding: 'utf-8', stdio: 'pipe' });
      
      const logs = execSync(`tail -n 100 telemetry.log 2>/dev/null || true`, { encoding: 'utf-8' });
      
      if (logs) {
        const logLines = logs.split('\n');
        
        // Process each line
        for (const line of logLines) {
          // Check for telemetry-related messages
          if (line.includes('telemetry') || line.includes('Telemetry') || 
              line.includes('OpenTelemetry') || line.includes('otel') ||
              line.includes('OTEL') || line.includes('traces export')) {
            
            let prefix = '';
            
            // Color code errors and successes
            if (line.includes('error') || line.includes('Error') || line.includes('failed') || line.includes('Failed')) {
              prefix = `${RED}ERROR ${RESET}`;
            } else if (line.includes('Received telemetry event')) {
              prefix = `${GREEN}EVENT ${RESET}`;
            } else if (line.includes('traces export')) {
              prefix = `${BLUE}EXPORT${RESET}`;
            } else {
              prefix = `${BLUE}INFO ${RESET}`;
            }
            
            console.log(`${prefix} ${line}`);
          }
        }
      }
    } catch (e) {
      // Ignore errors, they're expected sometimes
    }
  }, 1000);
}

// Run the monitoring
runTailCommand(); 