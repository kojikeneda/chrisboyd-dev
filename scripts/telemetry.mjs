#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to execute commands
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return false;
  }
}

// Get the root directory of the project
const rootDir = process.cwd();

// Path to telemetry.js
const telemetryJsPath = path.join(rootDir, 'static', 'js', 'telemetry.js');

// Functions for the different operations
async function startLocalDevelopment() {
  console.log('Starting local development environment...');
  return runCommand('./dev.sh', rootDir);
}

async function deployWorker() {
  console.log('Deploying Cloudflare Worker...');
  
  // First login to Cloudflare
  console.log('Checking Cloudflare login status...');
  runCommand('npx wrangler whoami || npx wrangler login', path.join(rootDir, 'telemetry-service', 'worker-js'));
  
  // Then deploy
  return runCommand('npx wrangler deploy', path.join(rootDir, 'telemetry-service', 'worker-js'));
}

async function updateWorkerUrl() {
  return new Promise((resolve) => {
    rl.question('Enter your Cloudflare username: ', (username) => {
      if (!username) {
        console.log('Username is required. Aborting.');
        resolve(false);
        return;
      }
      
      try {
        // Read the telemetry.js file
        let content = fs.readFileSync(telemetryJsPath, 'utf8');
        
        // Update the production URL
        content = content.replace(
          /['"]https:\/\/chrisboyd-telemetry\..*?\.workers\.dev\/collect['"]/,
          `'https://chrisboyd-telemetry.${username}.workers.dev/collect'`
        );
        
        // Write the updated content back
        fs.writeFileSync(telemetryJsPath, content);
        
        console.log(`Updated telemetry.js with your Cloudflare Worker URL.`);
        resolve(true);
      } catch (error) {
        console.error(`Error updating telemetry.js: ${error.message}`);
        resolve(false);
      }
    });
  });
}

async function rebuildHugoSite() {
  console.log('Rebuilding Hugo site...');
  return runCommand('hugo', rootDir);
}

// Main menu
async function showMenu() {
  console.log('\n========================================');
  console.log('Telemetry Management');
  console.log('========================================');
  console.log('1. Start local development (Hugo + Telemetry Service)');
  console.log('2. Deploy Cloudflare Worker');
  console.log('3. Update Worker URL in telemetry.js');
  console.log('4. Rebuild Hugo site');
  console.log('5. Full deployment workflow (2+3+4)');
  console.log('0. Exit');
  
  return new Promise((resolve) => {
    rl.question('\nSelect an option: ', (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function main() {
  try {
    // Check for command line arguments
    const args = process.argv.slice(2);
    if (args.length > 0) {
      const option = args[0];
      
      switch (option) {
        case '1':
          await startLocalDevelopment();
          break;
        
        case '2':
          await deployWorker();
          break;
        
        case '3':
          await updateWorkerUrl();
          break;
        
        case '4':
          await rebuildHugoSite();
          break;
        
        case '5':
          console.log('Running full deployment workflow...');
          const deploySuccess = await deployWorker();
          if (deploySuccess) {
            // Default to kojikeneda if running in automated mode
            if (args.length > 1) {
              // Use the second argument as the username
              try {
                let content = fs.readFileSync(telemetryJsPath, 'utf8');
                content = content.replace(
                  /['"]https:\/\/chrisboyd-telemetry\..*?\.workers\.dev\/collect['"]/,
                  `'https://chrisboyd-telemetry.${args[1]}.workers.dev/collect'`
                );
                fs.writeFileSync(telemetryJsPath, content);
                console.log(`Updated telemetry.js with Cloudflare Worker URL: ${args[1]}`);
                await rebuildHugoSite();
              } catch (error) {
                console.error(`Error updating telemetry.js: ${error.message}`);
              }
            } else {
              const updateSuccess = await updateWorkerUrl();
              if (updateSuccess) {
                await rebuildHugoSite();
              }
            }
          }
          break;
        
        default:
          console.log('Invalid option. Please provide a valid option (1-5).');
      }
      
      rl.close();
      return;
    }
    
    // Interactive mode if no arguments provided
    let exit = false;
    
    while (!exit) {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          await startLocalDevelopment();
          exit = true; // Exit after starting dev because it's a long-running process
          break;
        
        case '2':
          await deployWorker();
          break;
        
        case '3':
          await updateWorkerUrl();
          break;
        
        case '4':
          await rebuildHugoSite();
          break;
        
        case '5':
          console.log('Running full deployment workflow...');
          const deploySuccess = await deployWorker();
          if (deploySuccess) {
            const updateSuccess = await updateWorkerUrl();
            if (updateSuccess) {
              await rebuildHugoSite();
            }
          }
          break;
        
        case '0':
          exit = true;
          break;
        
        default:
          console.log('Invalid option. Please try again.');
      }
      
      if (!exit) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
      }
    }
    
    rl.close();
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  }
}

// Execute the main function
main(); 