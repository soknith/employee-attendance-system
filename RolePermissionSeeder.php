<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'Super Admin', 'description' => 'Full system access'],
            ['name' => 'admin', 'display_name' => 'School Admin', 'description' => 'Manage teachers and attendance'],
            ['name' => 'principal', 'display_name' => 'Principal', 'description' => 'View reports and approve leave'],
            ['name' => 'teacher', 'display_name' => 'Teacher', 'description' => 'Attendance and leave requests'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }

        $permissions = [
            ['name' => 'teacher.create', 'display_name' => 'Create Teacher', 'module' => 'teacher'],
            ['name' => 'teacher.edit', 'display_name' => 'Edit Teacher', 'module' => 'teacher'],
            ['name' => 'teacher.delete', 'display_name' => 'Delete Teacher', 'module' => 'teacher'],
            ['name' => 'attendance.view', 'display_name' => 'View Attendance', 'module' => 'attendance'],
            ['name' => 'attendance.create', 'display_name' => 'Create Attendance', 'module' => 'attendance'],
            ['name' => 'attendance.export', 'display_name' => 'Export Attendance', 'module' => 'attendance'],
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'module' => 'report'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'module' => 'report'],
            ['name' => 'leave.approve', 'display_name' => 'Approve Leave', 'module' => 'leave'],
            ['name' => 'settings.update', 'display_name' => 'Update Settings', 'module' => 'setting'],
            ['name' => 'users.manage', 'display_name' => 'Manage Users', 'module' => 'user'],
            ['name' => 'logs.view', 'display_name' => 'View Logs', 'module' => 'log'],
            ['name' => 'notifications.manage', 'display_name' => 'Manage Notifications', 'module' => 'notification'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }

        $superAdmin = Role::where('name', 'super_admin')->first();
        $admin = Role::where('name', 'admin')->first();
        $principal = Role::where('name', 'principal')->first();
        $teacher = Role::where('name', 'teacher')->first();

        $superAdmin->permissions()->sync(Permission::pluck('id'));
        $admin->permissions()->sync(Permission::whereIn('name', [
            'teacher.create', 'teacher.edit', 'teacher.delete',
            'attendance.view', 'attendance.create', 'attendance.export',
            'reports.view', 'reports.export',
            'leave.approve', 'settings.update', 'logs.view', 'notifications.manage',
        ])->pluck('id'));
        $principal->permissions()->sync(Permission::whereIn('name', [
            'attendance.view', 'reports.view', 'reports.export', 'leave.approve',
        ])->pluck('id'));
        $teacher->permissions()->sync(Permission::whereIn('name', [
            'attendance.create',
        ])->pluck('id'));
    }
}
