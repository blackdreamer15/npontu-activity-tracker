#!/bin/sh
set -e

# Run migrations on startup
echo "Running migrations..."
php artisan migrate --force

# Execute the CMD from Dockerfile
echo "Starting application..."
exec "$@"
