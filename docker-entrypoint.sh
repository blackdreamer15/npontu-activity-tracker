#!/bin/sh
set -e

# Run migrations and clear caches on startup
echo "Preparing environment..."
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Execute the CMD from Dockerfile
echo "Starting application..."
exec "$@"
