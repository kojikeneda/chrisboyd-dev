#!/bin/bash

# Script to run Playwright tests after changes
# Usage: ./scripts/post-change-tests.sh

set -e

echo "🧪 Running comprehensive post-change tests..."

# Kill any running Hugo or telemetry servers
echo "Stopping any existing servers..."
pkill -f "hugo serve" || true
pkill -f "telemetry.mjs" || true
pkill -f "node scripts/telemetry" || true
sleep 2

# Clear Playwright cache to prevent stale resources
echo "Clearing Playwright browsers cache..."
npx playwright install-deps
npx playwright clear-cache

# Run the tests with more detailed output
echo "Running Playwright tests with detailed reporting..."
PWDEBUG=console npm run test -- --reporter=list,html

# Store the test result
TEST_RESULT=$?

# Always show the report URL regardless of test result
echo "📊 Test report available at: file://$(pwd)/playwright-report/index.html"

# If tests failed, provide more debugging information
if [ $TEST_RESULT -ne 0 ]; then
  echo "❌ Tests failed! Collecting additional diagnostic information..."
  
  # Check for network connectivity
  echo "Testing network connectivity to key endpoints..."
  curl -I https://chrisboyd-telemetry.chrisdboyd.workers.dev/collect || echo "Telemetry endpoint unreachable!"
  
  # Check for errors in the logs
  echo "Recent error logs:"
  grep -i "error\|exception\|fail" playwright-report/*.log 2>/dev/null || echo "No explicit errors found in logs"
  
  # Check Hugo generation
  echo "Checking Hugo build integrity..."
  ls -la public/ | grep -i "index.html" || echo "Missing index.html in public directory!"
  
  echo "❗ Please fix these issues before proceeding."
  exit 1
else
  echo "✅ All tests passed! Your changes are working correctly."
fi

echo "✨ Post-change verification complete" 