<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\UserRepository::class,
            \App\Repositories\UserRepository::class,
        );
        $this->app->bind(
            \App\Repositories\TeacherRepository::class,
            \App\Repositories\TeacherRepository::class,
        );
        $this->app->bind(
            \App\Repositories\AttendanceRepository::class,
            \App\Repositories\AttendanceRepository::class,
        );
        $this->app->bind(
            \App\Repositories\GpsRepository::class,
            \App\Repositories\GpsRepository::class,
        );
        $this->app->bind(
            \App\Repositories\DepartmentRepository::class,
            \App\Repositories\DepartmentRepository::class,
        );
        $this->app->bind(
            \App\Repositories\LeaveRepository::class,
            \App\Repositories\LeaveRepository::class,
        );
        $this->app->bind(
            \App\Repositories\NotificationRepository::class,
            \App\Repositories\NotificationRepository::class,
        );
        $this->app->bind(
            \App\Repositories\SettingRepository::class,
            \App\Repositories\SettingRepository::class,
        );
        $this->app->bind(
            \App\Repositories\ScheduleRepository::class,
            \App\Repositories\ScheduleRepository::class,
        );
        $this->app->bind(
            \App\Repositories\AcademicYearRepository::class,
            \App\Repositories\AcademicYearRepository::class,
        );
        $this->app->bind(
            \App\Repositories\HolidayRepository::class,
            \App\Repositories\HolidayRepository::class,
        );
        $this->app->bind(
            \App\Repositories\RoleRepository::class,
            \App\Repositories\RoleRepository::class,
        );
        $this->app->bind(
            \App\Repositories\PermissionRepository::class,
            \App\Repositories\PermissionRepository::class,
        );
        $this->app->bind(
            \App\Repositories\ActivityLogRepository::class,
            \App\Repositories\ActivityLogRepository::class,
        );
    }

    public function boot(): void
    {
        //
    }
}
