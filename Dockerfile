FROM composer:2 AS composer-stage
FROM php:8.4-cli-alpine AS build

WORKDIR /var/www/html

# Copy Composer from the official Composer image
COPY --from=composer-stage /usr/bin/composer /usr/bin/composer

# Install build dependencies needed by Composer and frontend tooling
RUN apk add --no-cache \
    git \
    unzip \
    nodejs \
    npm \
    libzip \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    libzip-dev \
    && docker-php-ext-install zip \
    && npm install -g pnpm \
    && apk del .build-deps

COPY composer.json composer.lock ./
RUN composer install \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . ./
RUN [ -f .env ] || printf "APP_NAME=Shinkuro\nAPP_ENV=production\nAPP_KEY=\nAPP_DEBUG=false\nAPP_URL=http://localhost\n" > .env \
    && php artisan key:generate --force --ansi
RUN pnpm run build
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

FROM php:8.4-cli-alpine AS runtime

WORKDIR /var/www/html

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    APP_ENV=production \
    APP_DEBUG=false

RUN apk add --no-cache \
    libpq \
    sqlite-libs \
    libzip \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    postgresql-dev \
    sqlite-dev \
    libzip-dev \
    && docker-php-ext-install pdo_pgsql pdo_sqlite zip \
    && apk del .build-deps

RUN addgroup -g 10001 -S app \
    && adduser -S -u 10001 -G app -h /home/appuser appuser

COPY --from=build /var/www/html/vendor ./vendor
COPY --from=build /var/www/html/public/build ./public/build
COPY artisan ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources ./resources
COPY routes ./routes
COPY composer.json composer.lock ./
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p storage/framework/{cache,sessions,testing,views} storage/logs bootstrap/cache \
    && chown -R appuser:app storage bootstrap/cache

USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD php -r '$conn=@fsockopen("127.0.0.1", 8080); if (!$conn) { exit(1); } fclose($conn);'

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
