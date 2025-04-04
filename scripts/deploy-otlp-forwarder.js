#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const WORKER_DIR = path.join(__dirname, '../workers/otlp-forwarder');

console.log('📦 Deploying OTLP Forwarder Worker...');

// Verify environment variables
if (!process.env.AUTH_TOKEN) {
  console.error(`❌ Missing required environment variable: AUTH_TOKEN`);
  console.error('Please set this in your .env file or environment before deploying.');
  process.exit(1);
}

if (!process.env.DASH0_API_KEY) {
  console.error(`❌ Missing required environment variable: DASH0_API_KEY`);
  console.error('Please set this in your .env file or environment before deploying.');
  process.exit(1);
}

// Deploy the worker
try {
  console.log('🚀 Deploying OTLP Forwarder...');
  
  // Set the secrets
  console.log('🔒 Setting secrets...');
  const tmpDir = path.join(os.tmpdir(), 'telemetry-secrets');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Set AUTH_TOKEN
  const authTokenFile = path.join(tmpDir, 'AUTH_TOKEN');
  fs.writeFileSync(authTokenFile, process.env.AUTH_TOKEN);
  
  try {
    execSync(`cd ${WORKER_DIR} && cat ${authTokenFile} | npx wrangler secret put AUTH_TOKEN`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('Warning: Failed to set AUTH_TOKEN secret, it might already exist');
  }

  // Set DASH0_API_KEY
  const apiKeyFile = path.join(tmpDir, 'DASH0_API_KEY');
  fs.writeFileSync(apiKeyFile, process.env.DASH0_API_KEY);
  
  try {
    execSync(`cd ${WORKER_DIR} && cat ${apiKeyFile} | npx wrangler secret put DASH0_API_KEY`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('Warning: Failed to set DASH0_API_KEY secret, it might already exist');
  }

  // Set DASH0_ENDPOINT if provided
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const endpointFile = path.join(tmpDir, 'DASH0_ENDPOINT');
    fs.writeFileSync(endpointFile, `https://${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`);
    
    try {
      execSync(`cd ${WORKER_DIR} && cat ${endpointFile} | npx wrangler secret put DASH0_ENDPOINT`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('Warning: Failed to set DASH0_ENDPOINT secret, it might already exist');
    }
  }

  // Set DASH0_DATASET if provided
  if (process.env.DASH0_DATASET) {
    const datasetFile = path.join(tmpDir, 'DASH0_DATASET');
    fs.writeFileSync(datasetFile, process.env.DASH0_DATASET);
    
    try {
      execSync(`cd ${WORKER_DIR} && cat ${datasetFile} | npx wrangler secret put DASH0_DATASET`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('Warning: Failed to set DASH0_DATASET secret, it might already exist');
    }
  }

  // Clean up
  try {
    fs.unlinkSync(authTokenFile);
    fs.unlinkSync(apiKeyFile);
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) fs.unlinkSync(path.join(tmpDir, 'DASH0_ENDPOINT'));
    if (process.env.DASH0_DATASET) fs.unlinkSync(path.join(tmpDir, 'DASH0_DATASET'));
    fs.rmdirSync(tmpDir);
  } catch (e) {
    // Ignore cleanup errors
  }
  
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync(`cd ${WORKER_DIR} && npm install`, { stdio: 'inherit' });
  
  // Deploy the worker
  console.log('🚀 Deploying worker...');
  execSync(`cd ${WORKER_DIR} && npx wrangler deploy`, { stdio: 'inherit' });
  
  console.log('✅ Worker deployed successfully!');
  
  // Update the telemetry.js file with the new worker endpoint
  console.log('🔄 Updating telemetry.js...');
  const telemetryJsPath = path.join(__dirname, '../static/js/telemetry.js');
  let telemetryJs = fs.readFileSync(telemetryJsPath, 'utf8');
  
  // Replace the telemetry endpoint
  telemetryJs = telemetryJs.replace(
    /const telemetryEndpoint = isProd\s*\?\s*'[^']*'/,
    `const telemetryEndpoint = isProd ? 'https://chrisboyd-telemetry.chrisdboyd.workers.dev/v1/traces'`
  );
  
  fs.writeFileSync(telemetryJsPath, telemetryJs);
  
  // Rebuild the Hugo site
  console.log('🔄 Rebuilding Hugo site...');
  execSync('hugo', { stdio: 'inherit' });
  
  console.log('🎉 Deployment complete! The OTLP forwarder is now running at:');
  console.log('https://chrisboyd-telemetry.chrisdboyd.workers.dev');
  console.log('\nTo view your telemetry data, visit:');
  console.log('https://chrisboyd-telemetry.chrisdboyd.workers.dev/traces');
  console.log('\nData is being forwarded to Dash0 with dataset:', process.env.DASH0_DATASET || 'default');
} catch (error) {
  console.error('❌ Failed to deploy worker:', error.message);
  process.exit(1);
} 