# 04 — Laravel Backend

## Architecture

The Laravel backend follows a layered architecture:

```
Controller (thin) → Service (business logic) → Repository (data access) → Model (Eloquent)
```

## Folder Structure

```
laravel-project/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/      # API controllers (thin)
│   │   ├── Middleware/            # Auth, role, language, theme
│   │   ├── Requests/              # Form request validation
│   │   └── Resources/            # API response transformers
│   ├── Models/                    # Eloquent models
│   ├── Repositories/              # Data access layer
│   ├── Services/                  # Business logic
│   ├── Events/                    # Domain events
│   ├── Listeners/                 # Event handlers
│   ├── Jobs/                      # Queue jobs
│   ├── Notifications/            # Laravel notifications
│   ├── Policies/                  # Authorization
│   └── Traits/                    # Shared traits
├── database/
│   ├── migrations/                # Ordered migrations
│   └── seeders/                   # Data seeders
├── routes/
│   └── api.php                    # API route definitions
└── config/
    ├── cors.php                   # CORS configuration
    ├── sanctum.php                # Sanctum config
    └── auth.php                   # Auth guards
```

## Key Patterns

### Repository Pattern
All database queries go through repositories, never directly in controllers or services.

### Service Layer
Business logic lives in services. Controllers call services, services call repositories.

### Form Requests
Every endpoint has a dedicated form request class for validation rules.

### API Resources
Every API response is transformed through a resource class for consistent shape.

## Auth

Laravel Sanctum provides token-based authentication. Tokens are issued at login and sent as Bearer tokens.

## Migration Order

1. roles
2. permissions
3. role_permission (pivot)
4. departments
5. academic_years
6. holidays
7. teachers
8. users
9. attendance_records
10. gps_logs
11. leave_requests
12. notifications
13. activity_logs
14. school_settings
15. teaching_schedules
16. personal_access_tokens
