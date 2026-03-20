#!/bin/bash
set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Creating storage and cache directories in $SCRIPT_DIR..."

# Create necessary storage directories
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Set permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

echo "Storage and cache directories created successfully!"

# Copy production environment file if it exists
if [ -f ".env.production" ]; then
    echo "Copying .env.production to .env..."
    cp .env.production .env
    echo "Environment file configured for production!"
fi

# Laravel requires APP_KEY (encryption, sessions). Render must set it in Dashboard → Environment.
if [ -z "${APP_KEY:-}" ]; then
    echo "=================================================================================="
    echo "ERROR: APP_KEY is not set."
    echo "Render Dashboard → your Web Service → Environment → add APP_KEY"
    echo "Generate locally: php artisan key:generate --show"
    echo "Use the full line value (starts with base64:)."
    echo "=================================================================================="
    exit 1
fi

# Clear route cache
echo "Clearing route cache..."
php artisan route:clear
php artisan cache:clear

# Run database migrations and seeders
echo "Running database migrations..."
php artisan migrate --force

echo "Seeding database with initial data..."
php artisan db:seed --force

echo "Build completed successfully!"
