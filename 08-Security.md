# 08 — Security

## Authentication

- Email/password via Supabase Auth (active) or Laravel Sanctum (production)
- Passwords hashed with bcrypt (cost factor 10)
- Session tokens persisted client-side, auto-refreshed
- No magic links or social providers (per requirements)

## Authorization

### Role-Based Access

| Role | Access Level |
|------|-------------|
| super_admin | Everything |
| admin | Teachers, reports, settings, leave approval |
| principal | Dashboard, reports, leave approval |
| teacher | Own attendance, leave, schedule, profile |

### RLS Policies (Supabase)

Every table has RLS enabled with policies scoped to `authenticated` users:
- SELECT: own data or all (depending on table)
- INSERT: own records only
- UPDATE: own profile or admin-only
- DELETE: own pending records or admin-only

Helper functions:
- `is_admin()` — role IN ('super_admin', 'admin')
- `is_staff_admin()` — role IN ('super_admin', 'admin', 'principal')

## Input Validation

- Frontend: form validation before submission
- Backend: Form Request classes (Laravel) / database constraints (Supabase)
- SQL injection: parameterized queries only (Eloquent / Supabase client)
- XSS: React auto-escapes, no dangerouslySetInnerHTML used

## API Security

- CORS configured for known frontend origins only
- Bearer token required on all endpoints except login
- Rate limiting on login endpoint (production)
- Accept-Language header respected for localized responses

## Data Protection

- Passwords never logged or returned in API responses
- Profile photos stored in Supabase Storage with user-scoped paths
- GPS coordinates stored but not exposed to other teachers
- Activity logs capture user actions for audit trail

## Session Management

- Token stored in localStorage
- Auto-removed on 401 response
- Sign-out clears token and Supabase session
- Auth state listener refreshes user on session changes
