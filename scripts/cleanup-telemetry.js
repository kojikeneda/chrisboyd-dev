#!/usr/bin/env node

/**
 * This script helps clean up the old telemetry implementation
 * after migrating to the new OpenTelemetry implementation.
 * 
 * It gives you options to:
 * 1. Archive the old telemetry-service directory
 * 2. Update references in scripts
 * 3. Create a backup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Root directory
const rootDir = path.resolve(__dirname, '..');

// Files that may need updating
const filesToUpdate = [
  'scripts/dev-start.js',
  'scripts/watch-telemetry.js',
  'dev.sh',
  'validate.sh',
  'mcp.config.json',
  'scripts/test-commands.js'
];

console.log(`
OpenTelemetry Migration Cleanup
===============================

This script will help clean up after migrating from the old telemetry implementation 
to the new OpenTelemetry Cloudflare Worker.

WARNING: This script will make changes to your codebase. Make sure you have a backup
or have committed your changes to git before proceeding.

Options:
1. Create a backup of telemetry-service
2. Archive old telemetry-service (moves to telemetry-service.old)
3. Update references in scripts
4. Exit
`);

rl.question('Enter your choice (1-4): ', (answer) => {
  switch (answer.trim()) {
    case '1':
      createBackup();
      break;
    case '2':
      archiveTelemetryService();
      break;
    case '3':
      updateReferences();
      break;
    case '4':
      console.log('Exiting without making changes.');
      rl.close();
      break;
    default:
      console.log('Invalid choice. Exiting.');
      rl.close();
  }
});

function createBackup() {
  console.log('\nCreating backup of telemetry-service...');
  
  const backupDir = path.join(rootDir, 'telemetry-service.bak');
  const sourceDir = path.join(rootDir, 'telemetry-service');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('The telemetry-service directory does not exist. Nothing to back up.');
    rl.close();
    return;
  }
  
  try {
    // Remove old backup if it exists
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    
    // Create a backup copy
    fs.cpSync(sourceDir, backupDir, { recursive: true });
    console.log(`✅ Backup created at: ${backupDir}`);
    rl.close();
  } catch (error) {
    console.error('Error creating backup:', error.message);
    rl.close();
  }
}

function archiveTelemetryService() {
  console.log('\nArchiving telemetry-service...');
  
  const archiveDir = path.join(rootDir, 'telemetry-service.old');
  const sourceDir = path.join(rootDir, 'telemetry-service');
  
  if (!fs.existsSync(sourceDir)) {
    console.log('The telemetry-service directory does not exist. Nothing to archive.');
    rl.close();
    return;
  }
  
  try {
    // Remove old archive if it exists
    if (fs.existsSync(archiveDir)) {
      fs.rmSync(archiveDir, { recursive: true, force: true });
    }
    
    // Rename directory
    fs.renameSync(sourceDir, archiveDir);
    console.log(`✅ telemetry-service archived to: ${archiveDir}`);
    rl.close();
  } catch (error) {
    console.error('Error archiving telemetry-service:', error.message);
    rl.close();
  }
}

function updateReferences() {
  console.log('\nUpdating references in scripts...');
  
  // Replacements to make
  const replacements = [
    {
      pattern: /pkill -f "go run.*telemetry-service\/main.go" .*?/g,
      replacement: '# Removed old telemetry service reference'
    },
    {
      pattern: /cd \$PROJECT_ROOT\/telemetry-service && go run main\.go &/g,
      replacement: '# OpenTelemetry is now handled by a Cloudflare Worker'
    },
    {
      pattern: /\btelemetry-service\/worker-js\b/g,
      replacement: 'otel-worker/otel-worker' 
    }
  ];
  
  for (const file of filesToUpdate) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let changed = false;
      
      for (const { pattern, replacement } of replacements) {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          content = newContent;
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated references in: ${file}`);
      } else {
        console.log(`No references found in: ${file}`);
      }
    } catch (error) {
      console.error(`Error updating ${file}:`, error.message);
    }
  }
  
  console.log('\nDone updating references.');
  rl.close();
}

// Handle readline close
rl.on('close', () => {
  console.log('\nCleanup complete.');
  process.exit(0);
}); 