# Folder Structure Template

## Frontend (React + Vite + TypeScript)

```
src/
├── components/          # Reusable UI components
│   ├── BottomNav.tsx
│   └── Toast.tsx
├── contexts/           # React context providers
│   ├── AuthContext.tsx
│   └── I18nContext.tsx
├── hooks/              # Custom hooks
│   ├── useGps.ts
│   └── useToasts.ts
├── lib/                # Core libraries and clients
│   ├── apiClient.ts
│   └── supabase.ts
├── pages/              # Screen components (one per view)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AttendancePage.tsx
│   ├── TeachersPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   ├── LeaveRequestsPage.tsx
│   ├── SchedulePage.tsx
│   ├── NotificationsPage.tsx
│   └── ProfilePage.tsx
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Backend (Laravel 12)

```
laravel-project/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Repositories/
│   ├── Services/
│   ├── Events/
│   ├── Listeners/
│   ├── Jobs/
│   ├── Notifications/
│   ├── Policies/
│   └── Traits/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/
```

## Documentation

```
SovannKiri-Attendance-Kit/
├── docs/
├── prompts/
└── templates/
```

## Rules

1. One file per screen/page
2. One file per model, controller, service, repository
3. Group by cohesion, not by type
4. Place files where readers expect them
5. Never create parallel hierarchies
6. Never create empty placeholder files
