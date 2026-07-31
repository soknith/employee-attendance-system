<?php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\GpsAttendanceController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(['language'])->group(function () {

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware(['auth:sanctum'])->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::prefix('profile')->group(function () {
            Route::post('/photo', [ProfileController::class, 'uploadPhoto']);
            Route::delete('/photo', [ProfileController::class, 'deletePhoto']);
        });

        Route::prefix('attendance')->group(function () {
            Route::post('/check-in', [GpsAttendanceController::class, 'checkIn']);
            Route::post('/check-out', [GpsAttendanceController::class, 'checkOut']);
            Route::post('/verify-gps', [GpsAttendanceController::class, 'verifyGps']);
            Route::get('/today', [AttendanceController::class, 'today']);
            Route::get('/history', [AttendanceController::class, 'history']);
            Route::get('/statistics', [AttendanceController::class, 'statistics']);
            Route::get('/', [AttendanceController::class, 'index']);
            Route::get('/{id}', [AttendanceController::class, 'show']);
        });

        Route::prefix('teachers')->group(function () {
            Route::get('/', [TeacherController::class, 'index']);
            Route::get('/search', [TeacherController::class, 'search']);
            Route::get('/{id}', [TeacherController::class, 'show']);
            Route::post('/', [TeacherController::class, 'store'])->middleware('role:admin,super_admin');
            Route::put('/{id}', [TeacherController::class, 'update'])->middleware('role:admin,super_admin');
            Route::delete('/{id}', [TeacherController::class, 'destroy'])->middleware('role:admin,super_admin');
            Route::patch('/{id}/status', [TeacherController::class, 'updateStatus'])->middleware('role:admin,super_admin');
        });

        Route::prefix('departments')->group(function () {
            Route::get('/', [DepartmentController::class, 'index']);
            Route::get('/{id}', [DepartmentController::class, 'show']);
            Route::post('/', [DepartmentController::class, 'store'])->middleware('role:admin,super_admin');
            Route::put('/{id}', [DepartmentController::class, 'update'])->middleware('role:admin,super_admin');
            Route::delete('/{id}', [DepartmentController::class, 'destroy'])->middleware('role:admin,super_admin');
        });

        Route::prefix('leaves')->group(function () {
            Route::get('/', [LeaveRequestController::class, 'index']);
            Route::get('/{id}', [LeaveRequestController::class, 'show']);
            Route::post('/', [LeaveRequestController::class, 'store']);
            Route::put('/{id}', [LeaveRequestController::class, 'update']);
            Route::delete('/{id}', [LeaveRequestController::class, 'destroy']);
            Route::patch('/{id}/approve', [LeaveRequestController::class, 'approve'])->middleware('role:admin,principal,super_admin');
            Route::patch('/{id}/reject', [LeaveRequestController::class, 'reject'])->middleware('role:admin,principal,super_admin');
        });

        Route::prefix('schedules')->group(function () {
            Route::get('/', [ScheduleController::class, 'index']);
            Route::post('/', [ScheduleController::class, 'store'])->middleware('role:admin,super_admin');
            Route::put('/{id}', [ScheduleController::class, 'update'])->middleware('role:admin,super_admin');
            Route::delete('/{id}', [ScheduleController::class, 'destroy'])->middleware('role:admin,super_admin');
        });

        Route::prefix('reports')->group(function () {
            Route::get('/daily', [ReportController::class, 'daily']);
            Route::get('/weekly', [ReportController::class, 'weekly']);
            Route::get('/monthly', [ReportController::class, 'monthly']);
            Route::get('/yearly', [ReportController::class, 'yearly']);
            Route::get('/teacher/{teacherId}', [ReportController::class, 'teacher']);
            Route::get('/department/{departmentId}', [ReportController::class, 'department']);
            Route::get('/export/pdf', [ReportController::class, 'exportPdf']);
            Route::get('/export/excel', [ReportController::class, 'exportExcel']);
        })->middleware('role:admin,principal,super_admin');

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/', [NotificationController::class, 'store'])->middleware('role:admin,super_admin');
            Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });

        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingController::class, 'index']);
            Route::put('/', [SettingController::class, 'update'])->middleware('role:admin,super_admin');
            Route::patch('/gps', [SettingController::class, 'updateGps'])->middleware('role:admin,super_admin');
            Route::patch('/theme', [SettingController::class, 'updateTheme']);
            Route::patch('/language', [SettingController::class, 'updateLanguage']);
        });

        Route::prefix('academic-years')->group(function () {
            Route::get('/', [AcademicYearController::class, 'index']);
            Route::post('/', [AcademicYearController::class, 'store'])->middleware('role:admin,super_admin');
            Route::put('/{id}', [AcademicYearController::class, 'update'])->middleware('role:admin,super_admin');
            Route::delete('/{id}', [AcademicYearController::class, 'destroy'])->middleware('role:admin,super_admin');
        });

        Route::prefix('holidays')->group(function () {
            Route::get('/', [HolidayController::class, 'index']);
            Route::post('/', [HolidayController::class, 'store'])->middleware('role:admin,super_admin');
            Route::put('/{id}', [HolidayController::class, 'update'])->middleware('role:admin,super_admin');
            Route::delete('/{id}', [HolidayController::class, 'destroy'])->middleware('role:admin,super_admin');
        });

        Route::prefix('roles')->middleware('role:super_admin')->group(function () {
            Route::get('/', [RoleController::class, 'index']);
            Route::post('/', [RoleController::class, 'store']);
            Route::put('/{id}', [RoleController::class, 'update']);
            Route::delete('/{id}', [RoleController::class, 'destroy']);
        });

        Route::prefix('permissions')->middleware('role:super_admin')->group(function () {
            Route::get('/', [PermissionController::class, 'index']);
            Route::post('/', [PermissionController::class, 'store']);
            Route::put('/{id}', [PermissionController::class, 'update']);
            Route::delete('/{id}', [PermissionController::class, 'destroy']);
        });

        Route::prefix('activity-logs')->middleware('role:admin,super_admin')->group(function () {
            Route::get('/', [ActivityLogController::class, 'index']);
        });
    });
});
