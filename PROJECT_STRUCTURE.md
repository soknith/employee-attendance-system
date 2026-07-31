# រចនាសម្ព័ន្ធគម្រោង SovannKiri Attendance

## ទិដ្ឋភាពរួម

គម្រោងនេះមាន 3 ផ្នែកសំខាន់៖

1. **`src/`** — កម្មវិធី React + TypeScript + Vite (ប្រើ Supabase)
2. **`laravel-project/`** — កម្មវិធី Laravel (API + Frontend ក្នុង resources/js)
3. **`Moblie-Sovannkiri/`** — កម្មវិធី Mobile (Frontend + Backend ដាច់ដោយឡែក)

---

## 1. ផ្នែក `src/` (React + TypeScript + Vite)

```
src/
├── App.tsx                      # កម្មវិធីចម្បង (router + layout)
├── main.tsx                     # ចំណុចចាប់ផ្ដើម React
├── index.css                    # ស្ទីលសកល (Tailwind)
├── vite-env.d.ts                # ប្រភេទ Vite
├── components/
│   ├── BottomNav.tsx            # របារនាំផ្លូវក្រោម
│   └── Toast.tsx                # សារជូនដំណឹង
├── contexts/
│   ├── AuthContext.tsx          # ស្ថានភាពចូលប្រព័ន្ធ
│   └── I18nContext.tsx          # ភាសា (EN/KM)
├── hooks/
│   ├── useGps.ts                # ទីតាំង GPS
│   └── useToasts.ts             # សារជូនដំណឹង
├── lib/
│   └── supabase.ts              # ការតភ្ជាប់ Supabase
└── pages/
    ├── AttendancePage.tsx       # ទំព័រវត្តមាន
    ├── DashboardPage.tsx        # ទំព័រផ្ទាំងគ្រប់គ្រង
    ├── LoginPage.tsx            # ទំព័រចូលប្រព័ន្ធ
    ├── ReportsPage.tsx          # ទំព័ររបាយការណ៍
    ├── SettingsPage.tsx         # ទំព័រការកំណត់
    └── TeachersPage.tsx         # ទំព័រគ្រូបង្វឹក
```

**ឯកសារកំណត់រចនាសម្ព័ន្ធ៖**
- `package.json` — សេវាប៉ាកេជ
- `vite.config.ts` — ការកំណត់ Vite
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — ការកំណត់ TypeScript
- `tailwind.config.js`, `postcss.config.js` — ការកំណត់ Tailwind
- `eslint.config.js` — ការកំណត់ ESLint
- `index.html` — ទំព័រ HTML ចម្បង
- `.env` — អថេរបរិស្ថាន (Supabase)
- `.gitignore`

**មាន Migrations Supabase ក្នុង `supabase/migrations/`។**

---

## 2. ផ្នែក `laravel-project/`

```
laravel-project/
├── .env.example                 # ឧទាហរណ៍អថេរបរិស្ថាន
├── README.md
├── composer.json                # សេវាប៉ាកេជ PHP
├── package.json                 # សេវាប៉ាកេជ JS
├── vite.config.js
├── bootstrap/app.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   └── sanctum.php
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AttendanceController.php
│   │   ├── AuthController.php
│   │   ├── LeaveRequestController.php
│   │   ├── ReportController.php
│   │   ├── SettingController.php
│   │   └── TeacherController.php
│   └── Models/
│       ├── AttendanceRecord.php
│       ├── Department.php
│       ├── LeaveRequest.php
│       ├── SchoolSetting.php
│       ├── Teacher.php
│       ├── TeachingSchedule.php
│       └── User.php
├── database/
│   ├── migrations/
│   │   ├── 2025_01_01_000001_create_users_table.php
│   │   ├── 2025_01_01_000002_create_departments_table.php
│   │   ├── 2025_01_01_000003_create_teachers_table.php
│   │   ├── 2025_01_01_000004_create_attendance_records_table.php
│   │   └── 2025_01_01_000005_create_remaining_tables.php
│   └── seeders/DatabaseSeeder.php
├── resources/
│   ├── css/app.css
│   ├── views/app.blade.php
│   └── js/
│       ├── App.jsx
│       ├── main.jsx
│       ├── Components/
│       │   ├── BottomNav.jsx
│       │   └── Toast.jsx
│       ├── Contexts/
│       │   ├── AuthContext.jsx
│       │   └── I18nContext.jsx
│       ├── Hooks/
│       │   ├── useGps.js
│       │   └── useToast.js
│       ├── Lib/api.js
│       ├── i18n/translations.js
│       └── Pages/
│           ├── AttendancePage.jsx
│           ├── DashboardPage.jsx
│           ├── LoginPage.jsx
│           ├── ReportsPage.jsx
│           ├── SettingsPage.jsx
│           └── TeachersPage.jsx
└── routes/
    ├── api.php
    ├── console.php
    └── web.php
```

---

## 3. ផ្នែក `Moblie-Sovannkiri/` (Mobile App)

### 3a. Backend (`Moblie-Sovannkiri/backend/`)

```
Moblie-Sovannkiri/backend/
├── .env.example
├── composer.json
├── bootstrap/app.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   └── sanctum.php
├── app/
│   ├── Events/
│   │   ├── AttendanceCheckedIn.php
│   │   └── LeaveRequestCreated.php
│   ├── Helpers/GpsHelper.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/AdminController.php
│   │   │   ├── Attendance/AttendanceController.php
│   │   │   ├── Auth/AuthController.php
│   │   │   ├── Notification/NotificationController.php
│   │   │   ├── Principal/PrincipalController.php
│   │   │   ├── Profile/ProfileController.php
│   │   │   ├── Report/ReportController.php
│   │   │   ├── Setting/SettingController.php
│   │   │   ├── Teacher/LeaveRequestController.php
│   │   │   └── Teacher/TeacherController.php
│   │   ├── Middleware/RoleMiddleware.php
│   │   ├── Requests/
│   │   │   ├── CheckInRequest.php
│   │   │   ├── CheckOutRequest.php
│   │   │   ├── StoreLeaveRequest.php
│   │   │   ├── StoreTeacherRequest.php
│   │   │   ├── UpdateSettingsRequest.php
│   │   │   └── UpdateTeacherRequest.php
│   │   └── Resources/
│   │       ├── AttendanceResource.php
│   │       ├── DepartmentResource.php
│   │       ├── LeaveRequestResource.php
│   │       └── TeacherResource.php
│   ├── Listeners/
│   │   ├── LogAttendanceCheckIn.php
│   │   └── NotifyPrincipalOnLeaveRequest.php
│   ├── Models/
│   │   ├── ActivityLog.php
│   │   ├── Attendance.php
│   │   ├── Department.php
│   │   ├── LeaveRequest.php
│   │   ├── Notification.php
│   │   ├── QrCode.php
│   │   ├── Role.php
│   │   ├── SchoolSetting.php
│   │   ├── Teacher.php
│   │   ├── TeachingSchedule.php
│   │   └── User.php
│   ├── Notifications/
│   │   ├── AttendanceNotification.php
│   │   └── LeaveRequestApprovedNotification.php
│   ├── Policies/
│   │   ├── AttendancePolicy.php
│   │   └── TeacherPolicy.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   └── EventServiceProvider.php
│   ├── Repositories/
│   │   ├── ActivityLogRepository.php
│   │   ├── AttendanceRepository.php
│   │   ├── DepartmentRepository.php
│   │   ├── LeaveRequestRepository.php
│   │   ├── NotificationRepository.php
│   │   ├── SchoolSettingRepository.php
│   │   ├── TeacherRepository.php
│   │   └── UserRepository.php
│   └── Services/
│       ├── AttendanceService.php
│       ├── AuthService.php
│       ├── LeaveRequestService.php
│       ├── NotificationService.php
│       ├── ReportService.php
│       ├── SettingService.php
│       └── TeacherService.php
├── database/
│   ├── migrations/
│   │   ├── 2025_01_01_000001_create_users_table.php
│   │   ├── 2025_01_01_000002_create_departments_table.php
│   │   ├── 2025_01_01_000002_create_roles_table.php
│   │   ├── 2025_01_01_000003_create_departments_table.php
│   │   ├── 2025_01_01_000003_create_teachers_table.php
│   │   ├── 2025_01_01_000004_create_attendances_table.php
│   │   ├── 2025_01_01_000004_create_teachers_table.php
│   │   ├── 2025_01_01_000005_create_attendance_table.php
│   │   ├── 2025_01_01_000005_create_teaching_schedules_table.php
│   │   └── 2025_01_01_000006_create_remaining_tables.php
│   └── seeders/DatabaseSeeder.php
├── resources/
│   ├── css/app.css
│   ├── lang/
│   │   ├── en/messages.php
│   │   └── km/messages.php
│   └── views/app.blade.php
└── routes/
    ├── admin.php
    ├── api.php
    ├── auth.php
    ├── console.php
    ├── principal.php
    ├── teacher.php
    └── web.php
```

### 3b. Frontend (`Moblie-Sovannkiri/frontend/`)

```
Moblie-Sovannkiri/frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── components/
    │   └── common/
    │       ├── BottomNav.jsx
    │       ├── Spinner.jsx
    │       ├── StatCard.jsx
    │       ├── StatusBadge.jsx
    │       └── TopBar.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── I18nContext.jsx
    │   └── ToastContext.jsx
    ├── hooks/useGps.js
    ├── layouts/MainLayout.jsx
    ├── pages/
    │   ├── admin/
    │   │   ├── DashboardPage.jsx
    │   │   ├── ReportsPage.jsx
    │   │   ├── SettingsPage.jsx
    │   │   └── TeachersPage.jsx
    │   ├── auth/LoginPage.jsx
    │   ├── profile/ProfilePage.jsx
    │   └── teacher/
    │       ├── AttendancePage.jsx
    │       └── LeaveRequestsPage.jsx
    ├── services/
    │   ├── api.js
    │   ├── attendanceService.js
    │   ├── authService.js
    │   ├── leaveService.js
    │   ├── notificationService.js
    │   ├── profileService.js
    │   ├── reportService.js
    │   ├── settingService.js
    │   └── teacherService.js
    ├── styles/app.css
    └── utils/translations.js
```

### 3c. ឯកសារ (`Moblie-Sovannkiri/docs/`)

```
Moblie-Sovannkiri/docs/
├── api.md
├── architecture.md
└── database.md
```

---

## របៀប Copy

ដើម្បី copy គម្រោងទាំងមូល អ្នកអាចធ្វើដូចខាងក្រោម៖

```bash
# Copy ទាំងមូល (លើកលែង node_modules, vendor, dist)
cp -r project/ /path/to/destination/

# បន្ទាប់មកលុបឯកសារមិនចាំបាច់
cd /path/to/destination/
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "vendor" -type d -exec rm -rf {} +
find . -name "dist" -type d -exec rm -rf {} +
```

ឬប្រើ `rsync` ងាយជាង៖

```bash
rsync -av --exclude='node_modules' --exclude='vendor' --exclude='dist' \
  project/ /path/to/destination/
```

---

## ការរត់គម្រោង

### React App (`src/`)
```bash
npm install
npm run dev      # រត់នៅលើ port 5173
npm run build    # សាងសង់ production
```

### Laravel (`laravel-project/` និង `Moblie-Sovannkiri/backend/`)
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve   # រត់នៅលើ port 8000
```

### Mobile Frontend (`Moblie-Sovannkiri/frontend/`)
```bash
npm install
npm run dev      # រត់នៅលើ port 5173
```
