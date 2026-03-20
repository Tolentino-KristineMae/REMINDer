FROM php:8.2-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-client \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --no-dev

# Use .env.production as the container's .env
# (We overwrite .env to ensure the container always uses the intended DB settings.)
RUN if [ -f .env.production ]; then cp -f .env.production .env; fi

# Avoid build-time config caching so runtime env (and the copied .env) is respected.

EXPOSE 8000

CMD ["sh", "-c", "if [ -f .env.production ]; then cp -f .env.production .env; fi && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
