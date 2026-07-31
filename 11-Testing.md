# 11 — Testing

## Strategy

### Frontend
- **Type checking:** `npm run typecheck` (tsc --noEmit)
- **Build verification:** `npm run build` (Vite production build)
- **Linting:** `npm run lint` (ESLint)
- **Manual testing:** Verify UI in browser via dev server

### Backend (Laravel)
- **Unit tests:** PHPUnit, test services and repositories in isolation
- **Feature tests:** Test API endpoints end-to-end
- **GPS tests:** Test Haversine distance calculation with known coordinates

## Test Commands

```bash
# Frontend
npm run typecheck
npm run build
npm run lint

# Backend
php artisan test
php artisan test --filter=AttendanceTest
php artisan test --filter=AuthTest
php artisan test --filter=GpsHelperTest
```

## Test Cases

### Auth
- Login with valid credentials → success
- Login with wrong password → error
- Login with non-existent email → error
- Access protected route without token → 401

### Attendance
- Check-in within geofence → success
- Check-in outside geofence → rejected
- Duplicate check-in same day → rejected
- Late check-in after grace period → status "late"

### Leave
- Teacher creates leave request → pending
- Admin approves → status "approved"
- Admin rejects → status "rejected"
- Teacher cancels own pending → deleted

### GPS
- Haversine distance with known points → correct value
- Accuracy > 50m → warning
- Distance > radius → invalid
