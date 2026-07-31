# 14 — Production Checklist

## Pre-Launch

### Database
- [ ] All migrations applied
- [ ] RLS enabled on every table
- [ ] Policies tested with each role
- [ ] Seed data verified (admin accounts, school settings)
- [ ] Backup strategy configured
- [ ] Passwords hashed with bcrypt

### Backend (Laravel)
- [ ] `.env` configured with production values
- [ ] APP_DEBUG=false
- [ ] Config cached (`php artisan config:cache`)
- [ ] Routes cached (`php artisan route:cache`)
- [ ] Views cached (`php artisan view:cache`)
- [ ] Storage linked (`php artisan storage:link`)
- [ ] Queue worker running (Supervisor)
- [ ] Scheduler running (cron)
- [ ] HTTPS enforced
- [ ] CORS configured for frontend domain only

### Frontend (React)
- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] Environment variables set (VITE_API_URL, VITE_SUPABASE_*)
- [ ] No console.log in production code
- [ ] Error boundaries tested
- [ ] Loading states for all async operations
- [ ] Dark mode tested on all pages
- [ ] Khmer language tested on all pages
- [ ] Responsive design tested (320px, 768px, 1920px)

### Security
- [ ] No secrets in source code
- [ ] API tokens expire properly
- [ ] Rate limiting on login endpoint
- [ ] Input validation on all forms
- [ ] XSS prevention verified
- [ ] SQL injection prevention verified
- [ ] GPS coordinates not exposed cross-user

### Functionality
- [ ] Login works for all roles
- [ ] GPS check-in within geofence works
- [ ] GPS check-in outside geofence rejected
- [ ] Late check-in marked correctly
- [ ] Leave request submit/approve/reject works
- [ ] Teacher CRUD works (admin only)
- [ ] Schedule create/delete works
- [ ] Notifications display and mark-read works
- [ ] Settings update works (admin only)
- [ ] Profile update and photo upload works
- [ ] Password change works
- [ ] Language switch works instantly
- [ ] Dark/light mode toggle works

### Performance
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Bundle size reasonable (< 500KB gzipped)

## Post-Launch

- [ ] Monitor error logs
- [ ] Monitor queue failures
- [ ] Monitor database performance
- [ ] Schedule regular backups
- [ ] Document any issues and fixes
