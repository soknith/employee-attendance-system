# Project Checklist

## Database
- [ ] All tables created with proper migrations
- [ ] RLS enabled on every table
- [ ] 4 CRUD policies per table (SELECT, INSERT, UPDATE, DELETE)
- [ ] auth.uid() used for ownership checks
- [ ] Foreign keys defined
- [ ] Seed data inserted (admin accounts, school settings, departments)
- [ ] Passwords hashed with bcrypt

## Auth
- [ ] Email/password login works
- [ ] Session persists across reloads
- [ ] Token auto-refresh works
- [ ] Logout clears session and token
- [ ] Password change validates current password
- [ ] Profile photo upload and removal works
- [ ] 401 response triggers redirect to login

## Attendance (GPS)
- [ ] Check-in within geofence succeeds
- [ ] Check-in outside geofence rejected
- [ ] GPS accuracy validation works
- [ ] Late check-in marked correctly
- [ ] Duplicate check-in prevented
- [ ] Check-out works
- [ ] Duplicate check-out prevented
- [ ] Attendance history paginated
- [ ] GPS permission denial handled
- [ ] GPS timeout handled

## Leave Management
- [ ] Teacher can submit leave request
- [ ] Admin/principal can approve
- [ ] Admin/principal can reject
- [ ] Teacher can cancel own pending request
- [ ] Date range and reason validated
- [ ] Status badges display correctly

## Teacher Management
- [ ] Admin can create teacher
- [ ] Admin can edit teacher
- [ ] Admin can delete teacher
- [ ] Search and filter works
- [ ] Department assignment works
- [ ] Non-admins cannot access

## Schedule
- [ ] Create schedule with subject, day, time
- [ ] Delete schedule works
- [ ] Teachers see only own schedules
- [ ] Admins see all schedules
- [ ] Grouped by day of week

## Notifications
- [ ] List displays own notifications
- [ ] Mark individual as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Unread indicator (dot) shows
- [ ] Type-based icons display

## Dashboard
- [ ] Admin sees total/present/late/absent counts
- [ ] Teacher sees today's check-in status
- [ ] Quick action buttons work

## Settings
- [ ] School name (Khmer + English) editable
- [ ] GPS coordinates and radius editable
- [ ] Time windows configurable
- [ ] Only admin can access

## Reports
- [ ] Daily report generates
- [ ] Monthly report generates
- [ ] Yearly report generates
- [ ] Per-teacher report generates

## UI/UX
- [ ] Khmer language works on all pages
- [ ] English language works on all pages
- [ ] Dark mode works on all pages
- [ ] Light mode works on all pages
- [ ] Responsive at 320px (mobile)
- [ ] Responsive at 768px (tablet)
- [ ] Responsive at 1920px (desktop)
- [ ] Loading states for all async operations
- [ ] Error states for all failures
- [ ] Empty states for all lists
- [ ] Toast notifications for actions

## Build
- [ ] `npm run build` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No console.log in production code
- [ ] No unused imports
- [ ] No TypeScript errors

## Security
- [ ] No secrets in source code
- [ ] Input validated on all forms
- [ ] Authorization enforced on all endpoints
- [ ] RLS policies tested with each role
- [ ] GPS coordinates not exposed cross-user
