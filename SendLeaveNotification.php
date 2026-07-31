<?php

namespace App\Listeners;

use App\Events\LeaveRequested;
use App\Events\LeaveApproved;
use App\Events\LeaveRejected;
use App\Services\NotificationService;
use App\Models\User;

class SendLeaveNotification
{
    public function __construct(private NotificationService $notificationService)
    {
    }

    public function handle(LeaveRequested|LeaveApproved|LeaveRejected $event): void
    {
        $user = User::where('teacher_id', $event->teacherId)->first();

        if (!$user) {
            return;
        }

        if ($event instanceof LeaveRequested) {
            $admins = User::whereHas('role', function ($q) {
                $q->whereIn('name', ['admin', 'principal']);
            })->get();

            foreach ($admins as $admin) {
                $this->notificationService->sendToUser(
                    $admin->id,
                    'New Leave Request',
                    'A teacher has submitted a leave request.',
                    'leave_request',
                );
            }
        } elseif ($event instanceof LeaveApproved) {
            $this->notificationService->sendToUser(
                $user->id,
                'Leave Approved',
                'Your leave request has been approved.',
                'leave_approved',
            );
        } elseif ($event instanceof LeaveRejected) {
            $this->notificationService->sendToUser(
                $user->id,
                'Leave Rejected',
                'Your leave request has been rejected.',
                'leave_rejected',
            );
        }
    }
}
