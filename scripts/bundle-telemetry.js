#!/usr/bin/env node

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Ensure the target directory exists
const targetDir = path.resolve(__dirname, '../static/js');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Bundle OpenTelemetry modules
async function buildTelemetryBundle() {
  try {
    const result = await esbuild.build({
      entryPoints: [path.resolve(__dirname, '../src/telemetry/index.js')],
      bundle: true,
      minify: true,
      sourcemap: false,
      target: ['es2020'],
      format: 'iife', // Immediately invoked function expression
      globalName: 'opentelemetry',
      outfile: path.resolve(__dirname, '../static/js/telemetry-bundle.js'),
      // Define conditions for package.json exports
      conditions: ['browser', 'import', 'default'],
      // Handle Node.js built-ins that might be referenced
      platform: 'browser',
      define: {
        'process.env.NODE_ENV': '"production"',
        'global': 'window'
      },
    });

    console.log('✅ Successfully bundled OpenTelemetry modules');
    return true;
  } catch (error) {
    console.error('Error bundling OpenTelemetry modules:', error);
    return false;
  }
}

// Run the build
buildTelemetryBundle(); 