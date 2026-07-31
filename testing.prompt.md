# Testing Prompt

You are writing tests for the SovannKiri Attendance Kit.

## Frontend Tests

### Build Verification
```bash
npm run build      # Vite production build must pass
npm run typecheck  # tsc --noEmit must pass
npm run lint       # ESLint must pass
```

### Manual UI Testing Checklist
- Login with each role (admin, teacher, principal)
- GPS check-in within geofence
- GPS check-in outside geofence (should fail)
- Leave request create, approve, reject
- Teacher CRUD (admin only)
- Schedule create, delete
- Notifications mark read, delete
- Settings update (admin only)
- Profile update, photo upload
- Password change
- Language switch (Khmer ↔ English)
- Dark/light mode toggle
- Responsive at 320px, 768px, 1920px

## Backend Tests (Laravel)

### PHPUnit
```bash
php artisan test
php artisan test --filter=AuthTest
php artisan test --filter=AttendanceTest
php artisan test --filter=GpsHelperTest
```

### Test Cases

**Auth:**
- Valid login returns token
- Wrong password returns 401
- Missing token returns 401
- Expired token returns 401

**Attendance:**
- Check-in within geofence succeeds
- Check-in outside geofence fails
- Duplicate check-in fails
- Late check-in marked as "late"

**Leave:**
- Teacher can create leave request
- Admin can approve
- Admin can reject
- Teacher can cancel own pending
- Teacher cannot approve own request

**GPS:**
- Haversine distance with known coordinates
- Edge case: same point → distance 0
- Edge case: antipodal points → max distance

## Rules

1. Test happy path and error cases
2. Test all role permissions
3. Test validation rules
4. Test GPS edge cases
5. Never skip failing tests — fix the code
