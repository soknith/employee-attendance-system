# API Prompt

You are designing and implementing the REST API for the SovannKiri Attendance Kit.

## Base URL

- Active: Supabase client (no base URL)
- Production: `/api/v1` prefix on Laravel

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation message"]
  }
}
```

## Auth Headers

```
Authorization: Bearer <token>
Accept-Language: en|km
Content-Type: application/json
```

## Endpoint Groups

1. **Auth** — login, logout, profile, password, photo
2. **Dashboard** — role-based stats
3. **Attendance** — check-in, check-out, history, GPS verify
4. **Teachers** — CRUD (admin)
5. **Departments** — list
6. **Leave Requests** — CRUD with approval flow
7. **Schedules** — CRUD
8. **Notifications** — list, mark read, delete
9. **Settings** — get/update (admin)
10. **Reports** — daily, monthly, yearly, per-teacher

## Rules

1. Never create duplicate endpoints
2. Use proper HTTP methods (GET, POST, PUT, DELETE)
3. Return correct status codes (200, 201, 400, 401, 403, 404, 422)
4. Validate all input via Form Requests
5. Authorize all endpoints via Policies or role middleware
6. Paginate list endpoints (20 per page default)
7. Transform all responses via API Resources
8. Log all mutations to activity_logs
