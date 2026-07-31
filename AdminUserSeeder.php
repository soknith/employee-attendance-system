<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'super_admin')->first();

        $department = Department::firstOrCreate(
            ['name_en' => 'Administration'],
            ['name_kh' => 'ការិយាល័យ', 'description' => 'Administration Department', 'status' => true],
        );

        $teacher = Teacher::firstOrCreate(
            ['teacher_code' => 'ADMIN001'],
            [
                'department_id' => $department->id,
                'first_name_kh' => 'អ្នក',
                'last_name_kh' => 'គ្រប់គ្រង',
                'first_name_en' => 'System',
                'last_name_en' => 'Admin',
                'gender' => 'male',
                'email' => 'admin@sovannkiri.edu.kh',
                'position' => 'System Administrator',
                'join_date' => now()->toDateString(),
                'employment_status' => 'active',
                'gps_enabled' => false,
                'status' => true,
            ],
        );

        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'teacher_id' => $teacher->id,
                'role_id' => $adminRole->id,
                'email' => 'admin@sovannkiri.edu.kh',
                'password' => Hash::make('Admin@2026'),
                'phone' => '+855 00 000 000',
                'status' => 'active',
            ],
        );
    }
}
