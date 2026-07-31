<?php

namespace App\Providers;

use App\Events\AttendanceCheckedIn;
use App\Events\AttendanceCheckedOut;
use App\Events\LeaveApproved;
use App\Events\LeaveRejected;
use App\Events\LeaveRequested;
use App\Events\PasswordChanged;
use App\Events\ProfileUpdated;
use App\Events\TeacherCreated;
use App\Events\TeacherDeleted;
use App\Events\TeacherUpdated;
use App\Listeners\CreateActivityLog;
use App\Listeners\GenerateDailyReport;
use App\Listeners\SendAttendanceNotification;
use App\Listeners\SendLeaveNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TeacherCreated::class => [
            [CreateActivityLog::class, 'handleTeacherCreated'],
        ],
        TeacherUpdated::class => [
            [CreateActivityLog::class, 'handleTeacherUpdated'],
        ],
        TeacherDeleted::class => [
            [CreateActivityLog::class, 'handleTeacherDeleted'],
        ],
        AttendanceCheckedIn::class => [
            [CreateActivityLog::class, 'handleAttendanceCheckedIn'],
            SendAttendanceNotification::class,
        ],
        AttendanceCheckedOut::class => [
            [CreateActivityLog::class, 'handleAttendanceCheckedOut'],
            SendAttendanceNotification::class,
            GenerateDailyReport::class,
        ],
        LeaveRequested::class => [
            [CreateActivityLog::class, 'handleLeaveRequested'],
            SendLeaveNotification::class,
        ],
        LeaveApproved::class => [
            [CreateActivityLog::class, 'handleLeaveApproved'],
            SendLeaveNotification::class,
        ],
        LeaveRejected::class => [
            [CreateActivityLog::class, 'handleLeaveRejected'],
            SendLeaveNotification::class,
        ],
        PasswordChanged::class => [
            [CreateActivityLog::class, 'handlePasswordChanged'],
        ],
        ProfileUpdated::class => [
            [CreateActivityLog::class, 'handleProfileUpdated'],
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
