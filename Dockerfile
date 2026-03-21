FROM php:8.2-cli

# Install OS dependencies: git (for composer), unzip (composer), and common extensions.
# Also install Node.js to build the React frontend.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip curl ca-certificates \
    libzip-dev libpng-dev libonig-dev libpq-dev \
  && docker-php-ext-install zip mbstring pdo pdo_pgsql fileinfo \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Node.js for frontend build
# Use 22.x to match the local/Render environment as closely as possible.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend first so `artisan` exists for Composer post-install scripts.
# (Laravel's Composer scripts run `php artisan package:discover`.)
COPY Rback ./Rback
RUN cd Rback && \
    cp .env.example .env && \
    composer install --no-dev --optimize-autoloader --no-interaction

# Build frontend and copy dist -> Laravel public
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build && cp -R dist/* ../Rback/public/

# (Optional) APP_KEY will be provided via Render Environment Variables at runtime.

# Create storage directories
RUN mkdir -p /app/Rback/storage/app/public/proofs /app/Rback/storage/app/private /app/Rback/storage/framework/cache /app/Rback/storage/framework/sessions /app/Rback/storage/framework/views /app/Rback/storage/logs

# Create bootstrap cache directory
RUN mkdir -p /app/Rback/bootstrap/cache

EXPOSE 8000

# Start Laravel. Render will set $PORT.
# Run migrations on boot so the DB schema is present in production.
CMD ["sh", "-c", "cd /app/Rback && mkdir -p storage/app/public/proofs storage/app/private storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]

