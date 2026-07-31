# 03 — Database

## Provider

- **Active (this environment):** Supabase (PostgreSQL)
- **Production target:** MySQL 8.0+ via Laravel migrations

## Tables

### profiles
Links to `auth.users`. Stores role and display name.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| role | text | admin, teacher, principal, super_admin |
| full_name | text | English name |
| full_name_km | text | Khmer name |
| avatar_url | text | Profile photo URL |
| phone | text | Contact number |
| is_active | boolean | Account status |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### teachers
Teacher records linked to auth users and departments.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id (nullable) |
| department_id | uuid | FK → departments.id |
| name | text | Full name (English) |
| full_name_km | text | Khmer name |
| email | text | |
| phone | text | |
| employee_code | text | Unique teacher code |
| gender | text | male, female |
| date_of_birth | date | |
| address | text | |
| avatar_url | text | |
| hire_date | date | |
| status | text | active, inactive |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### departments

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | English name |
| name_km | text | Khmer name |
| code | text | Short code |
| created_at | timestamptz | |

### attendance_records
GPS-based check-in/check-out records.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| teacher_id | uuid | FK → teachers.id |
| latitude | double | Check-in GPS lat |
| longitude | double | Check-in GPS lng |
| accuracy_meters | double | GPS accuracy |
| distance_meters | double | Distance from school |
| status | text | present, late, absent |
| check_type | text | check_in, check_out |
| attendance_status | text | present, late |
| scanned_at | timestamptz | Timestamp |
| check_out_at | timestamptz | Checkout time |
| device_info | text | Device name |
| browser_info | text | Browser string |
| ip_address | text | |
| note | text | |
| qr_code | text | (nullable, unused) |

### leave_requests

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| teacher_id | uuid | FK → teachers.id |
| leave_type | text | sick, personal, annual, maternity, other |
| start_date | date | |
| end_date | date | |
| reason | text | |
| status | text | pending, approved, rejected |
| approved_by | uuid | FK → auth.users.id |
| approved_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### teaching_schedules

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| teacher_id | uuid | FK → teachers.id |
| subject | text | |
| subject_km | text | Khmer subject name |
| grade | text | |
| day_of_week | integer | 0=Sunday … 6=Saturday |
| start_time | time | |
| end_time | time | |
| room | text | Classroom |
| created_at | timestamptz | |

### notifications

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users.id |
| title | text | |
| body | text | Message content |
| type | text | attendance, leave, announcement |
| related_id | uuid | Optional related record |
| is_read | boolean | |
| created_at | timestamptz | |

### school_settings
Single-row table for school configuration.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| school_name | text | English |
| school_name_km | text | Khmer |
| latitude | double | School GPS lat |
| longitude | double | School GPS lng |
| radius_meters | integer | Geofence radius |
| morning_start | time | |
| morning_late_after | time | Grace period cutoff |
| morning_end | time | |
| afternoon_start | time | |
| afternoon_late_after | time | |
| afternoon_end | time | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## RLS Policies

All tables have Row Level Security enabled. Policies follow this pattern:
- **SELECT:** Authenticated users can read most data; notifications scoped to own user
- **INSERT:** Authenticated users can insert their own records
- **UPDATE:** Own profile/notifications or admin-only for approvals
- **DELETE:** Own records or admin-only

Helper functions:
- `is_admin()` — checks if user role is super_admin or admin
- `is_staff_admin()` — checks if user role is super_admin, admin, or principal
