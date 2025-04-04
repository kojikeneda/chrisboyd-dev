#!/bin/bash
set -e

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "hugo server" 2>/dev/null || echo "No Hugo server running"
pkill -f "go run.*telemetry-service/main.go" 2>/dev/null || echo "No telemetry service running"

# Ensure we're in the project root directory
cd "$(dirname "$0")"
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
sleep 2
echo "Telemetry service started on port 8080"

# Set up a trap to clean up telemetry service when script exits
trap "echo 'Cleaning up telemetry service...'; kill $TELEMETRY_PID 2>/dev/null || true" EXIT

# Start Hugo server in the foreground
echo "Starting Hugo server..."
hugo server -D --config config.yaml

# This will only run if hugo server stops
echo "Dev environment shut down" 