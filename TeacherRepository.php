<?php

namespace App\Repositories;

use App\Models\Teacher;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TeacherRepository
{
    public function find(int $id): ?Teacher
    {
        return Teacher::with(['department', 'user'])->find($id);
    }

    public function findByCode(string $code): ?Teacher
    {
        return Teacher::where('teacher_code', $code)->first();
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Teacher::with(['department', 'user']);

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('teacher_code', 'like', "%{$search}%")
                    ->orWhere('first_name_kh', 'like', "%{$search}%")
                    ->orWhere('last_name_kh', 'like', "%{$search}%")
                    ->orWhere('first_name_en', 'like', "%{$search}%")
                    ->orWhere('last_name_en', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function all(): Collection
    {
        return Teacher::with(['department'])->orderBy('first_name_kh')->get();
    }

    public function create(array $data): Teacher
    {
        return Teacher::create($data);
    }

    public function update(int $id, array $data): ?Teacher
    {
        $teacher = Teacher::find($id);

        if ($teacher) {
            $teacher->update($data);
        }

        return $teacher;
    }

    public function delete(int $id): bool
    {
        return Teacher::destroy($id) > 0;
    }

    public function search(string $query): Collection
    {
        return Teacher::where('teacher_code', 'like', "%{$query}%")
            ->orWhere('first_name_kh', 'like', "%{$query}%")
            ->orWhere('first_name_en', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->limit(20)
            ->get();
    }

    public function countByStatus(bool $status): int
    {
        return Teacher::where('status', $status)->count();
    }
}
