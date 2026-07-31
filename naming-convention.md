# Naming Convention

## Files

### Frontend (React/TypeScript)
- Components: `PascalCase.tsx` — `BottomNav.tsx`, `Toast.tsx`
- Pages: `PascalCase + Page.tsx` — `LoginPage.tsx`, `DashboardPage.tsx`
- Contexts: `PascalCase + Context.tsx` — `AuthContext.tsx`
- Hooks: `camelCase + .ts` — `useGps.ts`, `useToasts.ts`
- Libraries: `camelCase.ts` — `apiClient.ts`, `supabase.ts`
- Types: inline in relevant files, no separate types file unless shared

### Backend (Laravel/PHP)
- Models: `PascalCase.php` — `Teacher.php`, `AttendanceRecord.php`
- Controllers: `PascalCase + Controller.php` — `AuthController.php`
- Services: `PascalCase + Service.php` — `AttendanceService.php`
- Repositories: `PascalCase + Repository.php` — `TeacherRepository.php`
- Requests: `PascalCase + Request.php` — `CheckInRequest.php`
- Resources: `PascalCase + Resource.php` — `TeacherResource.php`
- Migrations: `YYYY_MM_DD_HHMMSS_snake_case.php`
- Policies: `PascalCase + Policy.php` — `TeacherPolicy.php`

## Database

### Tables
- Snake_case, plural: `teachers`, `attendance_records`, `leave_requests`
- Pivot tables: `role_permission`

### Columns
- Snake_case: `user_id`, `created_at`, `full_name_km`
- Foreign keys: `{table_singular}_id` — `teacher_id`, `department_id`
- Booleans: `is_active`, `is_read`
- Timestamps: `created_at`, `updated_at`, `approved_at`

## Code

### TypeScript
- Variables: `camelCase` — `isLoading`, `attendanceRecords`
- Functions: `camelCase` — `handleSubmit`, `loadAttendance`
- Types/Interfaces: `PascalCase` — `Teacher`, `LeaveRequest`
- Constants: `UPPER_SNAKE_CASE` — `API_URL`, `DEFAULT_RADIUS`
- Components: `PascalCase` — `BottomNav`, `ToastContainer`

### PHP
- Classes: `PascalCase` — `AttendanceService`
- Methods: `camelCase` — `checkIn`, `getDashboard`
- Variables: `camelCase` — `$teacherId`, `$attendanceRecords`
- Constants: `UPPER_SNAKE_CASE` — `DEFAULT_RADIUS`

## API

- URLs: kebab-case — `/api/v1/leave-requests`, `/api/v1/check-in`
- JSON keys: snake_case — `created_at`, `teacher_id`
- Query params: snake_case — `page`, `per_page`, `search`

## Rules

1. Be consistent — never mix conventions in the same layer
2. Follow the existing pattern in neighboring files
3. Names should describe what something is or does
4. Avoid abbreviations except well-known ones (URL, GPS, API)
