#!/bin/sh

# Docker entrypoint script for flexible configuration

echo "Starting Mermaid UI application..."

# Check if we're in development mode
if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode"
    exec npm run dev -- --host 0.0.0.0 --port 5173
else
    echo "Running in production mode"
    # Start nginx
    exec nginx -g 'daemon off;'
fi