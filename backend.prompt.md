# Backend Prompt

You are building the Laravel 12 backend for the SovannKiri Attendance Kit, a GPS-based teacher attendance system for Cambodian schools.

## Architecture

Follow the layered pattern: Controller → Service → Repository → Model.

## Rules

1. Never create duplicate files, controllers, models, services, or repositories
2. Always use Repository Pattern for data access
3. Always use Service Layer for business logic
4. Always use Form Request classes for validation
5. Always use API Resources for response transformation
6. Always use Eloquent Relationships
7. Always use Database Transactions for multi-step operations
8. Keep controllers thin — only call services and return responses
9. Keep business logic in services — never in controllers
10. Follow PSR-12 coding standard

## Auth

- Laravel Sanctum token-based auth
- Email/password only (no social, no magic links)
- Passwords hashed with bcrypt

## Database

- MySQL 8.0+ for production
- Migrations in order: roles → permissions → departments → teachers → users → attendance → leave → notifications → settings → schedules

## GPS

- Haversine formula for distance calculation
- School geofence from school_settings table
- Validate: inside radius, GPS accuracy ≤ 50m
- Mark late if check-in after morning_late_after time

## Localization

- Support Khmer (km) and English (en)
- Accept-Language header determines response language
- Lang files in lang/en and lang/km directories

## API

- RESTful endpoints under /api/v1
- Consistent JSON response format
- Proper HTTP status codes
- CORS configured for frontend origins
