# SovannKiri Teacher Attendance Management System

A GPS-based teacher attendance management system for SovannKiri Primary School. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- **GPS Attendance** — Teachers check in/out using GPS location with Haversine distance verification
- **Dashboard** — Admin overview of present, late, absent, and on-leave teachers
- **Teacher Management** — Full CRUD for teacher profiles with departments
- **Leave Requests** — Teachers request leave; principals/admins approve or reject
- **ID Cards** — Generate, preview, and print school ID cards with QR codes
- **Reports** — Daily, monthly, and yearly attendance reports
- **Notifications** — Real-time notifications for leave approvals and announcements
- **QR Verification** — Scan-to-verify ID card authenticity
- **Bilingual** — Full English and Khmer language support
- **Dark Mode** — Complete dark theme support

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Icons:** Lucide React
- **QR Codes:** qrcode.react
- **Maps/GPS:** Browser Geolocation API with Haversine distance calculation

## Installation

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

The Supabase credentials are pre-configured. The app connects automatically.

## User Roles

| Role | Access |
|------|--------|
| Super Admin | Full system access including settings and user management |
| Admin | Manage teachers, attendance, ID cards, reports, departments |
| Principal | View reports, approve leave, manage teachers |
| Teacher | GPS attendance check in/out, leave requests, view ID card, profile |

## GPS Attendance Flow

1. Teacher presses Check In on the attendance page
2. App reads GPS coordinates (latitude, longitude, accuracy)
3. System calculates distance to school using Haversine formula
4. If within configured radius (default 150m), attendance is recorded
5. Status determined by time: Present (on time) or Late (after grace period)
6. Teacher checks out at end of day

## Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── idcard/          # ID card display and photo upload
│   ├── contexts/            # Auth and I18n contexts
│   ├── hooks/              # GPS, toast, and other custom hooks
│   ├── lib/                # API client and Supabase config
│   └── pages/              # Application pages
├── supabase/
│   └── migrations/         # Database migrations and RLS policies
├── public/                 # Static assets and favicon
├── index.html              # HTML entry point
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Configuration

School settings (GPS coordinates, attendance radius, check-in times, school name) are managed in the Settings page and stored in Supabase.

## Deployment

The app can be deployed to any static hosting provider:

```bash
npm run build
# Deploy the dist/ folder
```

## Developer

**Hour Soknith**
SovannKiri Primary School

## License

MIT License © 2026 SovannKiri Teacher Attendance Management System
