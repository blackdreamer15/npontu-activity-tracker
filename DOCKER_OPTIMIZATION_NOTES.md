# Docker Optimization Notes

This document captures the Docker optimization work done for this project, including what changed, why it changed, and the measured impact.

## Goals

- Fix Docker build failures during Composer install.
- Make production images smaller and cleaner.
- Separate development and production container usage.
- Improve startup reliability with health checks.

## Initial Issues

### 1) Composer install failed in Docker build

Build error indicated:

- missing `zip` support / extraction tooling (`zip` extension, `unzip`)
- missing `git` for source fallback downloads

### 2) Frontend build failed on Wayfinder generation

`pnpm run build` triggered:

- `php artisan wayfinder:generate --with-form`
- this required app bootstrapping and provider availability during build

### 3) Very large image size

- Earlier image size was around **816MB+**, largely due to Debian-based PHP base and broad runtime content.

## What We Changed

## 1. Build reliability fixes

In `Dockerfile` build stage we added dependencies required by Composer and asset build:

- `git`
- `unzip`
- PHP `zip` extension support
- Node + npm + pnpm for frontend build

Also ensured build-time app bootstrap is available by creating a minimal `.env` and generating app key during build when needed.

- **Fixed `pnpm install` crash in CI (Render):** Copied `pnpm-workspace.yaml` and `.npmrc` to the Docker context before running `pnpm install` so that pnpm security policies (e.g. `allowBuilds: unrs-resolver: true` and `ignore-scripts=true`) are respected during container build, resolving `[ERR_PNPM_IGNORED_BUILDS]` crashes.
- **Removed Unused runtime extensions:** Removed SQLite libraries (`sqlite-libs`, `sqlite-dev`, `pdo_sqlite`) and the unused `COMPOSER_ALLOW_SUPERUSER=1` environment variable from the final runtime container to minimize security surface area and keep the image size at a minimal ~209MB.

## 2. Build/runtime dependency separation

We used a two-pass Composer install in build stage:

1. install with dev packages to allow build tooling (Wayfinder, etc.)
2. run frontend build
3. prune to production PHP deps with:

`composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts --optimize-autoloader`

This keeps build tooling available when needed, but runtime vendor is production-only.

## 3. Runtime hardening and reliability

- Added non-root runtime user (`appuser`, uid/gid `10001`)
- Ensured writable paths exist and are owned correctly:
  - `storage/*`
  - `bootstrap/cache`
- Added app health checks (socket probe on `127.0.0.1:8080`)
- Added DB health checks (`pg_isready`) and startup gating via `depends_on` health condition.

## 4. Major size optimization

Switched from Debian PHP images to Alpine:

- `php:8.4-cli-bookworm` -> `php:8.4-cli-alpine`

Reduced runtime copy scope to app-required paths only (instead of copying whole project), and tightened `.dockerignore` to exclude non-runtime files.

## 5. Added production compose profile

Created `docker-compose.prod.yml` with:

- no source bind mount
- `restart: unless-stopped`
- production env defaults
- health checks for app and db
- `postgres:16-alpine`

## Results

- Previous optimized image: **816MB**
- Alpine optimized image: **209MB**

Approximate reduction: **~74%**

## Files Updated

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `docker-compose.prod.yml` (new)

## Commands Used for Validation

Build current optimized image:

```bash
docker build --no-cache -t npontu-activity-tracker:optimized-alpine .
```

Check resulting image sizes:

```bash
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

Validate production compose:

```bash
docker compose -f docker-compose.prod.yml config
```

Run production profile:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Notes / Trade-offs

- We still use `php artisan serve` for runtime process startup. It works, but a `php-fpm + nginx` split is a better long-term production pattern.
- Docker scanner still reports base-image vulnerabilities; those require base-image/package update cycles and regular rescan.
- Development compose keeps bind mounts for local iteration convenience; production profile intentionally avoids them.
