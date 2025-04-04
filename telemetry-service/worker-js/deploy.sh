#!/bin/bash
set -e

echo "Deploying Cloudflare Worker for telemetry collection..."

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please install Node.js and npm."
    exit 1
fi

# Deploy using wrangler
npx wrangler deploy

echo "Deployment complete!"
echo "Your worker is now available at https://chrisboyd-telemetry.<your-username>.workers.dev"
echo ""
echo "IMPORTANT: Don't forget to update static/js/telemetry.js with your actual worker URL"
echo "           and rebuild your Hugo site for the changes to take effect." 