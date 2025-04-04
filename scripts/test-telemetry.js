#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('=== TELEMETRY TESTING LOOP ===');

try {
  // 1. First, shut down any running servers
  console.log('\n[1/5] Stopping any running development services...');
  execSync('npm run dev:down', { stdio: 'inherit' });

  // 2. Check status to confirm everything is stopped
  console.log('\n[2/5] Verifying all services are stopped...');
  execSync('npm run dev:logs', { stdio: 'inherit' });

  // 3. Run the Playwright tests with detailed logging
  console.log('\n[3/5] Running Playwright tests with telemetry checks...');
  try {
    execSync('npx playwright test tests/telemetry.spec.ts --headed', { stdio: 'inherit' });
    console.log('\n✅ Telemetry tests passed!');
  } catch (error) {
    console.error('\n❌ Telemetry tests failed!');
    console.error('Check the test results for details on what failed.');
  }

  // 4. Run the dry-run of production deployment
  console.log('\n[4/5] Testing production deployment prerequisites...');
  execSync('npm run prod:deploy -- --dry-run', { stdio: 'inherit' });

  // 5. Clean up again
  console.log('\n[5/5] Final cleanup - stopping all development services...');
  execSync('npm run dev:down', { stdio: 'inherit' });

  console.log('\n=== TESTING COMPLETE ===');
} catch (error) {
  console.error(`\n❌ Error during testing: ${error.message}`);
  
  // Always try to clean up, even if there was an error
  try {
    console.log('\nAttempting final cleanup...');
    execSync('npm run dev:down', { stdio: 'ignore' });
  } catch (cleanupError) {
    console.error(`Error during cleanup: ${cleanupError.message}`);
  }
  
  process.exit(1);
} 