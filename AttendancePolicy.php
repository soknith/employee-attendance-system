<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AttendanceRecord;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, AttendanceRecord $record): bool
    {
        if ($user->isAdmin() || $user->isPrincipal()) {
            return true;
        }

        return $user->teacher_id === $record->teacher_id;
    }

    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    public function update(User $user, AttendanceRecord $record): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, AttendanceRecord $record): bool
    {
        return $user->isAdmin();
    }
}
