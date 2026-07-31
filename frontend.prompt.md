# Frontend Prompt

You are building the React + Vite + TypeScript frontend for the SovannKiri Attendance Kit, a GPS-based teacher attendance system for Cambodian schools.

## Tech Stack

- React 18 with hooks
- Vite 5 build tool
- TypeScript strict mode
- Tailwind CSS for styling
- Lucide React for icons
- Supabase JS client for backend

## Rules

1. Use `@/` path alias for all imports (maps to src/)
2. Import every symbol used — never reference unimported icons or components
3. Give every function parameter an explicit type (no implicit any)
4. Handle loading and error states for all async operations
5. Use Tailwind classes for all styling — no inline styles
6. Support dark mode with `dark:` prefix on all color classes
7. All user-facing text via translation keys in I18nContext
8. Support Khmer and English with instant language switching
9. Mobile-first responsive design
10. No `dangerouslySetInnerHTML` — prevent XSS

## Pages

- LoginPage — email/password sign in
- DashboardPage — role-based dashboard
- AttendancePage — GPS check-in/check-out
- TeachersPage — CRUD (admin only)
- ReportsPage — attendance reports
- SettingsPage — school settings (admin only)
- LeaveRequestsPage — submit, approve, reject
- SchedulePage — teaching schedule
- NotificationsPage — view and manage notifications
- ProfilePage — edit profile, change password, upload photo

## Navigation

- BottomNav with role-based tabs
- No router library — tab state in App.tsx
- Sign out button in nav bar

## Design

- Clean, modern, premium feel
- 8px spacing system
- Rounded corners and subtle shadows
- Micro-interactions (hover, active, loading states)
- Brand color: blue-based ramp (no purple/indigo)
- Sufficient color contrast in both light and dark modes
