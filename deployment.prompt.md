# Deployment Prompt

You are deploying the SovannKiri Attendance Kit to production.

## Active Environment (Supabase)

The app runs with:
- Frontend: Vite dev server (React + TypeScript)
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Credentials in `.env` (pre-populated)

No deployment needed for development — just run the dev server.

## Production Deployment (Laravel + MySQL)

### Step 1: Server Setup
```bash
# Install PHP 8.3, Composer, MySQL 8.0, Node.js 20
sudo apt update && sudo apt install php8.3 composer mysql-server nodejs npm
```

### Step 2: Backend
```bash
cd laravel-project
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
# Configure DB credentials in .env
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

### Step 3: Frontend
```bash
npm ci
# Set VITE_API_URL in .env to production API URL
npm run build
# Copy dist/ to web server document root
```

### Step 4: Process Management
```bash
# Supervisor for queue worker
sudo apt install supervisor
# Create /etc/supervisor/conf.d/worker.conf
# Run: php artisan queue:work --tries=3 --backoff=10

# Cron for scheduler
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

### Step 5: Web Server
- Nginx or Apache
- Document root: dist/ (frontend) or public/ (Laravel)
- Enable HTTPS (Let's Encrypt)
- Configure CORS in config/cors.php

### Step 6: Post-Deploy Verification
- [ ] Login works
- [ ] GPS check-in works
- [ ] All pages load
- [ ] No console errors
- [ ] HTTPS enforced
- [ ] Queue worker running
- [ ] Scheduler running

## Rules

1. Never deploy with APP_DEBUG=true
2. Never commit .env with secrets
3. Always run migrations with --force in production
4. Always cache config, routes, and views
5. Always set up Supervisor for queues
6. Always enable HTTPS (GPS requires it)
7. Always configure CORS for frontend domain only
