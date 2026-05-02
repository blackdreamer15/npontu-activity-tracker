#!/bin/sh
set -e

# Ensure storage directories exist and are writable
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

# Run migrations and reset caches
echo "Preparing environment..."
php artisan migrate --force || echo "Migration failed, continuing..."
php artisan optimize:clear || echo "Optimization clear failed, continuing..."

# Execute the CMD from Dockerfile
echo "Starting application..."
exec "$@"
