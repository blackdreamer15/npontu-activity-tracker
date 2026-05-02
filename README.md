# Activity Tracker

A high-performance Laravel + Inertia + React application designed for tracking daily team activities, status updates, and enterprise-level reporting.

## 🌐 Live Demo

**[View the live application →](https://npontu-activity-tracker.onrender.com/)**

Demo credentials available upon request.

## ✅ Features

1.  **Activity Definition**: Allows full CRUD management of daily tasks (e.g., "Daily SMS count monitoring").
2.  **Status Tracking**: Enables personnel to toggle activity status between **Done** and **Pending** with optional remarks.
3.  **Audit Trail**: Captures bio details of the personnel (User profile) and timestamp for every update.
4.  **Daily Hand-over View**: Provides a dedicated "Daily History" view that aggregates activity updates for hand-overs.
5.  **Historical Reporting**: Query activity histories across custom date ranges.
6.  **Secure Access**: Implements user authentication and access control.

## 🚀 Technical Highlights

- **Core**: Laravel, React, Inertia.js, TypeScript.
- **UI/UX**: Built with Shadcn/UI and Tailwind CSS. Uses Recharts for visual tracking.
- **Performance**:
    - Route-based code-splitting via `import.meta.glob`.
    - Selective lazy-loading of heavy/optional organisms (modals, charts).
- **Deployment**: Docker-ready (development and production compose profiles).

## 🛠 Getting Started

> This project uses `pnpm` for frontend package management and Vite for the build.

### 1) Install Dependencies

```bash
pnpm install
composer install
```

### 2) Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and provide at minimum the following keys:

- `APP_NAME`, `APP_URL`, `APP_ENV`, `APP_KEY`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `VITE_APP_NAME`

### 3) Database Initialization & Demo Data

```bash
php artisan migrate --seed

# The project contains an optional demo seeder command used during development:
# php artisan app:seed-demo --clean --users=5 --activities=10 --days=30
# If the custom command is not available, run: php artisan db:seed
```

### 4) Local Development (non-Docker)

```bash
# Start frontend dev server
pnpm dev

# Start backend dev server
php artisan serve --host=0.0.0.0 --port=8080
```

### 5) Development with Docker (recommended for consistent environment)

```bash
# Start dev environment (bind mounts)
docker compose up --build

# Run artisan commands inside the app container
docker compose exec app bash
docker compose exec app php artisan migrate --force
```

### 6) Production (build assets)

```bash
pnpm build
php artisan optimize
```

## 📊 Quality & Maintenance

Run these checks before demos or CI runs:

```bash
php artisan test            # Backend tests
pnpm run lint               # Frontend lint + autofix
pnpm run types:check        # TypeScript checks
vendor/bin/pint             # PHP formatting
```

### Troubleshooting: `tempnam()` / storage permissions

If you see `tempnam(): file created in the system's temporary directory` during view compilation, fix storage permissions inside your container or host:

Host:

```bash
# Adjust ownership (example: make current user owner)
sudo chown -R $(id -u):$(id -g) storage bootstrap/cache
chmod -R 0775 storage bootstrap/cache
```

Or inside container:

```bash
docker compose exec app bash -lc "chown -R www-data:www-data storage bootstrap/cache || chown -R $(id -u):$(id -g) storage bootstrap/cache; chmod -R 0775 storage bootstrap/cache"
php artisan view:clear
php artisan cache:clear
```

These commands ensure `storage/framework/views` is writable and prevent PHP from falling back to the system temp dir.

---

## CI / Quick Checklist (for interviews)

- Pull, install, and build: `pnpm install && composer install && pnpm build`
- Run backend tests: `php artisan test`
- With Docker: `docker compose up --build` then `docker compose exec app php artisan migrate --force`

## License

This project is available under the MIT License. See `LICENSE` for details if included.

_Developed with a focus on Logic, Code Clarity, UI Innovation, and Performance._
