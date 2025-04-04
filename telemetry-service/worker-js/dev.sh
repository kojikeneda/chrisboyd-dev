#!/bin/bash
set -e

# Configurable local worker port
WORKER_PORT=${WORKER_PORT:-8787}

# Check if port is available
if lsof -i :$WORKER_PORT > /dev/null 2>&1; then
    echo "Port $WORKER_PORT is already in use."
    # Find next available port
    while lsof -i :$WORKER_PORT > /dev/null 2>&1; do
        WORKER_PORT=$((WORKER_PORT + 1))
    done
    echo "Using alternative port $WORKER_PORT for worker."
fi

# Run the worker locally with wrangler
echo "Starting worker with Wrangler on port $WORKER_PORT..."
npx wrangler dev --local --port $WORKER_PORT

echo "Worker started! Press Ctrl+C to stop." 