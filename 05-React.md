# 05 — React Frontend

## Architecture

Single-page application built with React 18, Vite, TypeScript, and Tailwind CSS.

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── BottomNav.tsx   # Role-based bottom navigation
│   └── Toast.tsx       # Toast notification system
├── contexts/           # React context providers
│   ├── AuthContext.tsx  # Auth state and methods
│   └── I18nContext.tsx  # Language and translations
├── hooks/              # Custom hooks
│   ├── useGps.ts       # GPS geolocation hook
│   └── useToasts.ts    # Toast state management
├── lib/                # Core libraries
│   ├── apiClient.ts    # Supabase API layer
│   └── supabase.ts     # Supabase client
├── pages/              # Screen components
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
├── App.tsx             # Root component with routing
├── main.tsx            # Entry point
└── index.css          # Global styles + Tailwind
```

## State Management

- **Auth:** AuthContext with Supabase session
- **Toasts:** useToasts hook with ToastContainer
- **Server data:** Direct Supabase queries via apiClient
- **Local UI state:** useState per page

## Routing

Tab-based navigation (no router library). BottomNav switches between pages based on active tab ID. Role-based filtering determines which tabs are visible.

## Styling

- Tailwind CSS with custom brand colors
- Dark mode via `dark:` classes
- 8px spacing system
- Mobile-first responsive design
- Lucide React icons throughout

## Path Alias

`@/` maps to `src/` (configured in tsconfig and vite.config).

## Build

- `npm run build` — production build via Vite
- `npm run typecheck` — TypeScript type checking
- `npm run lint` — ESLint
