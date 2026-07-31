<?php

namespace App\Listeners;

use App\Events\AttendanceCheckedIn;
use App\Events\AttendanceCheckedOut;
use App\Services\NotificationService;
use App\Models\User;

class SendAttendanceNotification
{
    public function __construct(private NotificationService $notificationService)
    {
    }

    public function handle(AttendanceCheckedIn|AttendanceCheckedOut $event): void
    {
        $user = User::where('teacher_id', $event->teacherId)->first();

        if (!$user) {
            return;
        }

        if ($event instanceof AttendanceCheckedIn) {
            $this->notificationService->sendToUser(
                $user->id,
                'Check-in Successful',
                'Your attendance has been recorded.',
                'attendance_success',
            );
        } else {
            $this->notificationService->sendToUser(
                $user->id,
                'Check-out Successful',
                'Your check-out has been recorded.',
                'attendance_success',
            );
        }
    }
}
