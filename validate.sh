#!/bin/bash
set -e

# Function to kill processes by port
kill_process_on_port() {
  local port=$1
  local pid=$(lsof -t -i:$port)
  if [ ! -z "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid 2>/dev/null || true
    sleep 1
  fi
}

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "hugo server" 2>/dev/null || echo "No Hugo server running"
pkill -f "go run.*telemetry-service/main.go" 2>/dev/null || echo "No telemetry service running"
kill_process_on_port 8080
kill_process_on_port 1313

# Ensure we're in the project root directory
cd $(dirname "$0")
PROJECT_ROOT=$(pwd)

# Verify Hugo config exists
if [ ! -f "config.yaml" ] && [ ! -f "config.toml" ]; then
  echo "Error: Hugo configuration file not found in $PROJECT_ROOT"
  exit 1
fi

# Start the telemetry service in the background
echo "Starting telemetry service..."
cd $PROJECT_ROOT/telemetry-service && go run main.go &
TELEMETRY_PID=$!

# Navigate back to project root
cd $PROJECT_ROOT

# Wait for telemetry service to start
sleep 3
echo "Telemetry service started on port 8080"

# Build Hugo site with latest telemetry.js changes
echo "Building Hugo site..."
hugo

# Start Hugo server in the background
echo "Starting Hugo server..."
hugo server -D &
HUGO_PID=$!

# Wait for Hugo server to start
sleep 5
echo "Hugo server started on port 1313"

# Run Playwright tests
echo "Running Playwright tests..."
npx playwright test tests/telemetry.spec.ts || {
  echo "Telemetry tests failed!"
  # Clean up processes even if tests fail
  kill $TELEMETRY_PID 2>/dev/null || true
  kill $HUGO_PID 2>/dev/null || true
  exit 1
}

# Clean up processes after tests
echo "Cleaning up processes..."
kill $TELEMETRY_PID 2>/dev/null || true
kill $HUGO_PID 2>/dev/null || true

echo "Validation complete! Telemetry is working correctly." 