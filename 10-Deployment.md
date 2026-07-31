# 10 — Deployment

## Active Environment (Supabase)

The app runs entirely in the browser with Supabase as the backend:
1. Frontend built with Vite, served by dev server
2. Supabase project provisioned with credentials in `.env`
3. Database migrations applied via Supabase MCP tools
4. RLS policies enforced at the database level

## Production Deployment (Laravel + MySQL)

### Prerequisites
- PHP 8.3+
- Composer 2.7+
- MySQL 8.0+
- Node.js 20+
- Nginx or Apache

### Backend (Laravel)
```bash
cd laravel-project
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

### Frontend (React)
```bash
npm ci
npm run build
# Deploy dist/ to web server or CDN
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anon key |
| VITE_API_URL | Laravel API base URL (production) |

### Web Server Config

- Set document root to `dist/` (frontend) or `public/` (Laravel)
- Enable HTTPS (required for GPS)
- Configure CORS origins in `config/cors.php`

### Queue Worker (Laravel)
```bash
php artisan queue:work --tries=3 --backoff=10
```
Process via Supervisor for production.

### Scheduler (Laravel)
```bash
php artisan schedule:run
```
Add to crontab: `* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1`
