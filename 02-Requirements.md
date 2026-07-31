# 02 — Requirements

## Functional Requirements

### Authentication
- Email/password login ( all roles
- Session persistence with auto-refresh
- Password change with current password verification
- Profile photo upload and removal

### Attendance (GPS)
- Teacher checks in with current GPS coordinates
- System verifies teacher is within school geofence radius
- Late check-in automatically flagged (after configured grace period)
- Check-out records working hours
- Prevent duplicate check-in/check-out per day
- View personal attendance history
- Admins view all teachers' attendance

### Leave Management
- Teachers submit leave requests (sick, personal, annual, maternity, other)
- Specify date range and reason
- Admins/Principals approve or reject requests
- Teachers can cancel pending requests
- Status tracking: pending, approved, rejected

### Teacher Management (Admin)
- Create, edit, delete teacher records
- Assign to departments
- Search and filter teachers
- View individual attendance history

### Teaching Schedule
- Create weekly teaching schedules
- View by day of week
- Teachers see only their own schedules
- Admins see all schedules

### Notifications
- Real-time notification list
- Mark individual or all as read
- Delete notifications
- Type-based icons (attendance, leave, announcement)

### Dashboard
- Admin: total teachers, present, late, absent counts
- Teacher: today's check-in status, quick actions
- Role-based widgets

### Reports
- Daily, monthly, yearly attendance reports
- Per-teacher reports
- Export functionality

### Settings (Admin)
- School name (Khmer + English)
- GPS coordinates and geofence radius
- Morning/afternoon check-in time windows
- Late grace period configuration

## Non-Functional Requirements

- **Performance:** Page load < 2s, API response < 500ms
- **Security:** RLS on all tables, auth required, role-based policies
- **Accessibility:** WCAG 2.1 AA compliant
- **Localization:** Khmer and English with instant toggle
- **Theming:** Light and dark mode
- **Responsive:** 320px to 1920px viewport support
- **Offline:** Graceful error handling when network unavailable
