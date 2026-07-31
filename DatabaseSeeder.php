<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\ActivityLog;
use App\Models\AttendanceRecord;
use App\Models\Department;
use App\Models\GpsLog;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\Notification;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SchoolSetting;
use App\Models\Teacher;
use App\Models\TeachingSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SchoolSettingSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
