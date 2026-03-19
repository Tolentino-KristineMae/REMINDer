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

# Copy only composer files first for better layer caching
COPY Rback/composer.json Rback/composer.lock* ./Rback/
RUN cd Rback && composer install --no-dev --optimize-autoloader --no-interaction

# Copy the rest of the backend
COPY Rback ./Rback

# Build frontend and copy dist -> Laravel public
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend
RUN cd frontend && npm run build && rm -rf ../Rback/public/* && cp -R dist/* ../Rback/public/

# Ensure Laravel has a key available at build-time.
# Note: Render will still provide APP_KEY at runtime. If APP_KEY isn't set yet,
# Laravel will fall back to whatever is in .env inside the container (if any).
RUN cd Rback && if [ -z "$APP_KEY" ]; then true; fi

EXPOSE 8000

# Start Laravel. Render will set $PORT.
# Run migrations on boot so the DB schema is present in production.
CMD ["sh", "-c", "cd /app/Rback && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]

