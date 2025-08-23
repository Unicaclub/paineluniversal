#!/bin/sh
set -e

# Get the port from environment variable, default to 3000 if not set
PORT=${PORT:-3000}

# Replace the port in nginx configuration
sed -i "s/listen 3000;/listen $PORT;/g" /etc/nginx/nginx.conf

# Start nginx
echo "Starting nginx on port $PORT"
exec nginx -g "daemon off;"
