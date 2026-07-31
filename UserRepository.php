<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function find(int $id): ?User
    {
        return User::with(['teacher.department', 'role'])->find($id);
    }

    public function findByUsername(string $username): ?User
    {
        return User::with(['teacher.department', 'role'])->where('username', $username)->first();
    }

    public function findByEmail(string $email): ?User
    {
        return User::with(['teacher.department', 'role'])->where('email', $email)->first();
    }

    public function all(): Collection
    {
        return User::with(['teacher', 'role'])->get();
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::with(['teacher', 'role']);

        if (isset($filters['role_id'])) {
            $query->where('role_id', $filters['role_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('username', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(int $id, array $data): ?User
    {
        $user = User::find($id);

        if ($user) {
            $user->update($data);
        }

        return $user;
    }

    public function delete(int $id): bool
    {
        return User::destroy($id) > 0;
    }

    public function updateLastLogin(User $user, string $ip): void
    {
        $user->update([
            'last_login' => now(),
            'last_login_ip' => $ip,
        ]);
    }
}
