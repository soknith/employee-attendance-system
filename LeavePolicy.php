<?php

namespace App\Policies;

use App\Models\User;
use App\Models\LeaveRequest;

class LeavePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, LeaveRequest $leave): bool
    {
        if ($user->isAdmin() || $user->isPrincipal()) {
            return true;
        }

        return $user->teacher_id === $leave->teacher_id;
    }

    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    public function update(User $user, LeaveRequest $leave): bool
    {
        return $user->teacher_id === $leave->teacher_id && $leave->status === 'pending';
    }

    public function delete(User $user, LeaveRequest $leave): bool
    {
        return $user->teacher_id === $leave->teacher_id && $leave->status === 'pending';
    }

    public function approve(User $user, LeaveRequest $leave): bool
    {
        return $user->isAdmin() || $user->isPrincipal();
    }

    public function reject(User $user, LeaveRequest $leave): bool
    {
        return $user->isAdmin() || $user->isPrincipal();
    }
}
