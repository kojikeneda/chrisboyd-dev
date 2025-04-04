#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const WORKER_DIR = path.join(__dirname, '../otel-worker/otel-worker');
const WRANGLER_PATH = path.join(WORKER_DIR, 'node_modules/.bin/wrangler');

console.log('📦 Deploying Cloudflare Worker for OpenTelemetry...');

// Verify environment variables
if (!process.env.AUTH_TOKEN) {
  console.error(`❌ Missing required environment variable: AUTH_TOKEN`);
  console.error('Please set this in your .env file or environment before deploying.');
  process.exit(1);
}

// Deploy the worker
try {
  console.log('🚀 Deploying otel-worker...');
  
  // Set the authentication secret
  console.log('🔒 Setting AUTH_TOKEN secret...');
  const tmpDir = path.join(os.tmpdir(), 'telemetry-secrets');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const secretFile = path.join(tmpDir, 'AUTH_TOKEN');
  fs.writeFileSync(secretFile, process.env.AUTH_TOKEN);
  
  try {
    execSync(`cd ${WORKER_DIR} && cat ${secretFile} | npx wrangler secret put AUTH_TOKEN`, { stdio: 'inherit' });
  } finally {
    // Clean up
    fs.unlinkSync(secretFile);
    try { fs.rmdirSync(tmpDir); } catch (e) { /* ignore */ }
  }
  
  // Apply DB migrations
  console.log('🗄️ Applying database migrations...');
  execSync(`cd ${WORKER_DIR} && echo "yes" | npx wrangler d1 migrations apply chrisboyd-telemetry-db --remote`, { stdio: 'inherit' });
  
  // Deploy the worker
  console.log('🚀 Deploying worker...');
  execSync(`cd ${WORKER_DIR} && npx wrangler deploy`, { stdio: 'inherit' });
  
  console.log('✅ Worker deployed successfully!');
  
  // Rebuild the Hugo site
  console.log('🔄 Rebuilding Hugo site...');
  execSync('npm run telemetry:build', { stdio: 'inherit' });
  
  console.log('🎉 Deployment complete! The otel-worker is now running at:');
  console.log('https://chrisboyd-otel-worker.chrisdboyd.workers.dev');
  console.log('\nTo view your telemetry data, visit:');
  console.log('https://chrisboyd-otel-worker.chrisdboyd.workers.dev/traces');
} catch (error) {
  console.error('❌ Failed to deploy worker:', error.message);
  process.exit(1);
} 