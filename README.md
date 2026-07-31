# SovannKiri Attendance System

Laravel 12 + React + MySQL + Bootstrap 5 + GPS/QR Attendance + Khmer/English

## សូមអានការពន្យល់ / Read this first

កម្មវិធីនេះប្រើ Laravel 12 (PHP) សម្រាប់ backend, React សម្រាប់ frontend, MySQL សម្រាប់ database, និង Bootstrap 5 សម្រាប់ UI.

## តម្រូវការ / Requirements

1. **PHP 8.2+** — ទាញយកពី https://www.php.net/
2. **Composer** — ទាញយកពី https://getcomposer.org/
3. **Node.js 18+** — ទាញយកពី https://nodejs.org/
4. **MySQL** (via XAMPP) — ទាញយកពី https://www.apachefriends.org/
5. **npm** — មាននៅក្នុង Node.js

## ជំហានដំឡើង / Installation Steps

### ១. ដំឡើង XAMPP
- ទាញយក XAMPP និងដំឡើង
- បើក XAMPP Control Panel
- ចាប់ផ្តើម **Apache** និង **MySQL**

### ២. បង្កើត Database
- បើក browser ចូល http://localhost/phpmyadmin
- បង្កើត database ឈ្មោះ `sovannkiri_attendance`
- Encoding: `utf8mb4_unicode_ci`

### ៣. ដាក់កូដទៅក្នុង Laravel folder
- Copy រាល់ file ទាំងអស់ពី folder `laravel-project` នេះ ទៅដាក់ក្នុង Laravel folder របស់អ្នក

### ៤. ដំឡើង PHP Dependencies
```bash
composer install
```

### ៥. ដំឡើង Frontend Dependencies
```bash
npm install
```

### ៦. កំណត់ Environment
```bash
copy .env.example .env
php artisan key:generate
```

កែប្រែ `.env` ប្រសិនបើចាំបាច់:
```
DB_DATABASE=sovannkiri_attendance
DB_USERNAME=root
DB_PASSWORD=
```

### ៧. រត់ Database Migration + Seeder
```bash
php artisan migrate
php artisan db:seed
```

### ៨. រត់គេហទំព័រ
បើក terminal ២:

**Terminal ១ (Laravel API):**
```bash
php artisan serve
```
→ API រត់នៅ http://localhost:8000

**Terminal ២ (React Frontend):**
```bash
npm run dev
```
→ គេហទំព័ររត់នៅ http://localhost:5173

### ៩. បើក browser
ចូល http://localhost:5173

## គណនីសម្រាប់ Login

| ឈ្មោះ | អ៊ីមែល | ពាក្យសម្ងាត់ | តួនាទី |
|------|--------|------------|-------|
| Hour Soknith | hour.soknith@sovannkiri.edu.kh | Soknith27 | Admin |
| Mao Nath | mao.nath@sovannkiri.edu.kh | NATH@@sovann | Admin |
| Hol Kimhien | hol.kimhien@sovannkiri.edu.kh | KIMhien@@Sovan | Teacher |
| Oeung Rum | oeung.rum@sovannkiri.edu.kh | RUM@@Kiry | Teacher |
| Y Saman | y.saman@sovannkiri.edu.kh | SAMan@@Kiry | Teacher |
| Hang Sinuon | hang.sinuon@sovannkiri.edu.kh | SINuon@@sovann | Teacher |
| Try Chanther | try.chanther@sovannkiri.edu.kh | CHANther@@sova | Teacher |
| Khvea Vanra | khvea.vanra@sovannkiri.edu.kh | VANra@@kiry | Teacher |
| Ek Pisey | ek.pisey@sovannkiri.edu.kh | PIsey@@kiry | Teacher |
| Soeurng Thary | soeurng.thary@sovannkiri.edu.kh | THAry@@sovann | Teacher |
| Ken Many | ken.many@sovannkiri.edu.kh | MANY@@sovann | Teacher |
| Lyy Naa | lyy.naa@sovannkiri.edu.kh | LYna@@Kiry | Teacher |

## មុខងារ / Features

- **Login** — ចូលប្រព័ន្ធជាមួយអ៊ីមែល និងពាក្យសម្ងាត់
- **Dashboard** — មើលសង្ខេបវត្តមានប្រចាំថ្ងៃ និងប្រចាំខែ
- **GPS Attendance** — ចុះឈ្មោះចូល/ចេញជាមួយ GPS location
- **QR Code** — បង្កើត និងស្កេន QR Code
- **Teacher Management** — គ្រប់គ្រងព័ត៌មានគ្រូបង្រៀន (Admin)
- **Reports** — របាយការណ៍ប្រចាំថ្ងៃ និងប្រចាំខែ
- **Settings** — កំណត់ GPS, ម៉ោងវេន (Admin)
- **Khmer/English** — ប្តូរភាសាបាន

## រចនាសម្ព័ន្ធ / Structure

```
laravel-project/
├── app/
│   ├── Http/Controllers/Api/    # API Controllers
│   └── Models/                  # Eloquent Models
├── database/
│   ├── migrations/              # Database tables
│   └── seeders/                 # Sample data
├── resources/
│   ├── css/app.css              # Bootstrap 5 + custom styles
│   └── js/                      # React frontend
│       ├── Components/          # Reusable components
│       ├── Contexts/           # Auth & i18n contexts
│       ├── Hooks/              # GPS, Toast hooks
│       ├── i18n/               # Khmer/English translations
│       ├── Lib/                # API client
│       └── Pages/              # Page components
├── routes/api.php              # API routes
├── composer.json               # PHP dependencies
├── package.json                # JS dependencies
└── vite.config.js              # Vite config
```

## បញ្ហាញ៉ក់ / Troubleshooting

- **CORS error**: ប្រាកដថា `SANCTUM_STATEFUL_DOMAINS` នៅក្នុង `.env` មាន `localhost:5173`
- **Database connection**: ប្រាកដថា MySQL រត់នៅ XAMPP ហើយ database `sovannkiri_attendance` មានរួច
- **GPS not working**: ត្រូវប្រើ HTTPS ឬ localhost (browser ត្រូវការ secure context សម្រាប់ GPS)
