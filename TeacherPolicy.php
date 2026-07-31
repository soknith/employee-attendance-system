<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Teacher;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isPrincipal();
    }

    public function view(User $user, Teacher $teacher): bool
    {
        if ($user->isAdmin() || $user->isPrincipal()) {
            return true;
        }

        return $user->teacher_id === $teacher->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Teacher $teacher): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->teacher_id === $teacher->id;
    }

    public function delete(User $user, Teacher $teacher): bool
    {
        return $user->isAdmin();
    }
}
