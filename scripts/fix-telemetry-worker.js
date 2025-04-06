#!/usr/bin/env node

/**
 * Script to fix telemetry worker deployment
 * This will:
 * 1. Deploy the worker with proper environment variables
 * 2. Update the telemetry.js file with the correct URL
 * 3. Verify the worker is working properly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const REPO_ROOT = path.resolve(__dirname, '..');
const WORKER_DIR = path.join(REPO_ROOT, 'telemetry-service', 'worker-js');
const TELEMETRY_JS_PATH = path.join(REPO_ROOT, 'static', 'js', 'telemetry.js');

/**
 * Run a command and return the output
 */
function run(command, cwd = process.cwd(), silent = false) {
  try {
    if (!silent) console.log(`Running: ${command}`);
    return execSync(command, { cwd, encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Deploy the worker with proper environment variables
 */
async function deployWorker(username) {
  console.log('\n==== Deploying Telemetry Worker ====');
  
  // Check if we have required environment variables
  let dashApiKey = process.env.DASH0_API_KEY;
  if (!dashApiKey) {
    dashApiKey = await new Promise(resolve => {
      rl.question('Enter your Dash0 API key: ', answer => {
        resolve(answer.trim());
      });
    });
  }
  
  // Create a temporary wrangler.toml with secrets
  const wranglerPath = path.join(WORKER_DIR, 'wrangler.toml');
  const originalWrangler = fs.readFileSync(wranglerPath, 'utf8');
  
  try {
    // Update wrangler.toml temporarily to include vars
    let updatedWrangler = originalWrangler.replace('[vars]', `[vars]
# Environment variables for telemetry
DASH0_API_KEY = "${dashApiKey}"
DASH0_ENDPOINT = "https://ingress.us-west-2.aws.dash0.com:4317"
DASH0_DATASET = "production"
OTEL_SERVICE_NAME = "chrisboyd-blog"`);
    
    // Write temporary file
    fs.writeFileSync(wranglerPath, updatedWrangler);
    
    // Deploy worker
    console.log('\nDeploying worker with wrangler...');
    run('npx wrangler deploy', WORKER_DIR);
    
    // Get worker info
    const workerInfo = run('npx wrangler whoami', WORKER_DIR, true);
    console.log('\nWorker deployment complete!');
    
    return username || (workerInfo ? workerInfo.split('@')[0].trim() : null);
  } finally {
    // Restore original wrangler.toml
    fs.writeFileSync(wranglerPath, originalWrangler);
  }
}

/**
 * Update telemetry.js with correct worker URL
 */
function updateTelemetryJs(username) {
  console.log('\n==== Updating Telemetry.js ====');
  if (!username) {
    console.error('Error: Could not determine Cloudflare username. Please provide manually.');
    return false;
  }
  
  try {
    let content = fs.readFileSync(TELEMETRY_JS_PATH, 'utf8');
    
    // Update worker URL
    const workerUrl = `https://chrisboyd-telemetry.${username}.workers.dev/collect`;
    console.log(`Setting worker URL to: ${workerUrl}`);
    
    // Replace the URL in the telemetry.js file
    content = content.replace(
      /const telemetryEndpoint = isProd\s*\?\s*['"]https:\/\/.*?\/collect['"]/,
      `const telemetryEndpoint = isProd\n    ? '${workerUrl}'`
    );
    
    // Update version comment
    content = content.replace(
      /\/\/ Version: .*$/m,
      `// Version: 1.0.7 - Fixed worker URL (${new Date().toISOString().split('T')[0]})`
    );
    
    // Write updated file
    fs.writeFileSync(TELEMETRY_JS_PATH, content);
    console.log('✅ Telemetry.js updated successfully!');
    
    return true;
  } catch (error) {
    console.error('Error updating telemetry.js:', error.message);
    return false;
  }
}

/**
 * Test the worker to verify it's working
 */
async function testWorker(username) {
  console.log('\n==== Testing Worker ====');
  if (!username) {
    console.error('Error: Username is required for testing');
    return false;
  }
  
  const workerUrl = `https://chrisboyd-telemetry.${username}.workers.dev/collect`;
  console.log(`Testing worker at: ${workerUrl}`);
  
  try {
    // Use curl since it's more likely to be available
    const result = run(`curl -s -X POST -H "Content-Type: application/json" -H "Dash0-Dataset: testing" -d '{"test":true}' ${workerUrl}`, process.cwd(), true);
    
    if (result && result.includes('success')) {
      console.log('✅ Worker test successful!');
      return true;
    } else {
      console.log('❌ Worker test failed. Response:');
      console.log(result || 'No response');
      return false;
    }
  } catch (error) {
    console.error('Error testing worker:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Fixing Telemetry Worker Deployment\n');
  
  // Ask for Cloudflare username
  const username = await new Promise(resolve => {
    rl.question('Enter your Cloudflare username: ', answer => {
      resolve(answer.trim());
    });
  });
  
  if (!username) {
    console.error('Error: Cloudflare username is required');
    process.exit(1);
  }
  
  // Deploy worker
  await deployWorker(username);
  
  // Update telemetry.js
  updateTelemetryJs(username);
  
  // Test worker
  await testWorker(username);
  
  // Rebuild Hugo site
  console.log('\n==== Rebuilding Hugo Site ====');
  run('hugo', REPO_ROOT);
  
  console.log('\n✅ Telemetry worker fix complete!');
  console.log('You should now commit and push the changes to deploy your site.');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 