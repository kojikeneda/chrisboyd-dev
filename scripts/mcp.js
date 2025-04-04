#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load the MCP config
const configPath = path.join(process.cwd(), 'mcp.config.json');
let config;

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configContent);
} catch (error) {
  console.error(`Error loading MCP config: ${error.message}`);
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node mcp.js <section> <command> [options]');
  console.log('Available sections:');
  for (const section in config.commands) {
    console.log(`  ${section}`);
    for (const cmd in config.commands[section]) {
      console.log(`    - ${cmd}: ${config.commands[section][cmd].description}`);
    }
  }
  process.exit(0);
}

const [section, command, ...options] = args;
const isDryRun = options.includes('--dry-run') || options.includes('dry-run');

// Check if section and command exist
if (!config.commands[section]) {
  console.error(`Section "${section}" not found in MCP config`);
  process.exit(1);
}

if (!config.commands[section][command]) {
  console.error(`Command "${command}" not found in section "${section}"`);
  process.exit(1);
}

// Special case for prod deploy with dry-run
if (section === 'prod' && command === 'deploy' && isDryRun) {
  console.log('=== PROD DEPLOY (DRY RUN) ===');
  console.log('This command would:');
  console.log('1. Deploy the Cloudflare Worker to prod');
  console.log('2. Update the telemetry.js with the correct worker URL');
  console.log('3. Rebuild the Hugo site');
  console.log('4. Provide guidance for Cloudflare Pages deployment');
  
  // Check prerequisites
  try {
    console.log('\nChecking prerequisites:');
    
    // Check wrangler
    try {
      console.log('- Wrangler: ');
      const wranglerVersion = execSync('npx wrangler --version', { stdio: 'pipe' }).toString().trim();
      console.log(`  ✅ Installed (${wranglerVersion})`);
    } catch (e) {
      console.log('  ❌ Not found or not accessible');
    }
    
    // Check Hugo
    try {
      console.log('- Hugo: ');
      const hugoVersion = execSync('hugo version', { stdio: 'pipe' }).toString().trim();
      console.log(`  ✅ Installed (${hugoVersion})`);
    } catch (e) {
      console.log('  ❌ Not found or not accessible');
    }
    
    // Check telemetry.js
    const telemetryJsPath = path.join(process.cwd(), 'static', 'js', 'telemetry.js');
    if (fs.existsSync(telemetryJsPath)) {
      console.log('- telemetry.js: ');
      console.log('  ✅ File exists');
    } else {
      console.log('- telemetry.js: ');
      console.log('  ❌ File not found');
    }
    
    console.log('\n✅ Dry run completed. No changes were made.');
  } catch (error) {
    console.error(`Error during dry run: ${error.message}`);
  }
  
  process.exit(0);
}

// Run the command
const cmdConfig = config.commands[section][command];

try {
  if (cmdConfig.command) {
    // Handle command
    const workingDir = cmdConfig.workingDirectory || process.cwd();
    console.log(`Running command in ${workingDir}: ${cmdConfig.command}`);
    execSync(cmdConfig.command, { 
      cwd: workingDir, 
      stdio: 'inherit'
    });
  } else if (cmdConfig.code) {
    // Handle code
    console.log(`Running code for "${section} ${command}"`);
    // Create a temp file with the code
    const tempFile = path.join(process.cwd(), 'temp-mcp-code.js');
    fs.writeFileSync(tempFile, cmdConfig.code);
    
    // Execute the code
    try {
      execSync(`node "${tempFile}"`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } finally {
      // Clean up
      try { fs.unlinkSync(tempFile); } catch (e) {}
    }
  } else {
    console.error(`No command or code defined for "${section} ${command}"`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Error executing command: ${error.message}`);
  process.exit(1);
} 