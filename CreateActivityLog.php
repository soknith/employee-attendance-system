<?php

namespace App\Listeners;

use App\Events\TeacherCreated;
use App\Events\TeacherUpdated;
use App\Events\TeacherDeleted;
use App\Events\AttendanceCheckedIn;
use App\Events\AttendanceCheckedOut;
use App\Events\LeaveRequested;
use App\Events\LeaveApproved;
use App\Events\LeaveRejected;
use App\Events\PasswordChanged;
use App\Events\ProfileUpdated;
use App\Services\ActivityLogService;

class CreateActivityLog
{
    public function __construct(private ActivityLogService $activityLogService)
    {
    }

    public function handleTeacherCreated(TeacherCreated $event): void
    {
        $this->activityLogService->log($event->teacherId, 'teacher', 'created', 'Teacher created');
    }

    public function handleTeacherUpdated(TeacherUpdated $event): void
    {
        $this->activityLogService->log($event->teacherId, 'teacher', 'updated', 'Teacher updated');
    }

    public function handleTeacherDeleted(TeacherDeleted $event): void
    {
        $this->activityLogService->log($event->teacherId, 'teacher', 'deleted', 'Teacher deleted');
    }

    public function handleAttendanceCheckedIn(AttendanceCheckedIn $event): void
    {
        $this->activityLogService->log($event->teacherId, 'attendance', 'check_in', 'Teacher checked in');
    }

    public function handleAttendanceCheckedOut(AttendanceCheckedOut $event): void
    {
        $this->activityLogService->log($event->teacherId, 'attendance', 'check_out', 'Teacher checked out');
    }

    public function handleLeaveRequested(LeaveRequested $event): void
    {
        $this->activityLogService->log($event->teacherId, 'leave', 'requested', 'Leave request submitted');
    }

    public function handleLeaveApproved(LeaveApproved $event): void
    {
        $this->activityLogService->log($event->approvedBy, 'leave', 'approved', 'Leave request approved');
    }

    public function handleLeaveRejected(LeaveRejected $event): void
    {
        $this->activityLogService->log($event->rejectedBy, 'leave', 'rejected', 'Leave request rejected');
    }

    public function handlePasswordChanged(PasswordChanged $event): void
    {
        $this->activityLogService->log($event->userId, 'auth', 'password_changed', 'Password changed');
    }

    public function handleProfileUpdated(ProfileUpdated $event): void
    {
        $this->activityLogService->log($event->userId, 'profile', 'updated', 'Profile updated');
    }
}
