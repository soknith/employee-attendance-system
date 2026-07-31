<?php

namespace App\Repositories;

use App\Models\LeaveRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class LeaveRepository
{
    public function find(int $id): ?LeaveRequest
    {
        return LeaveRequest::with(['teacher.department', 'approver'])->find($id);
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = LeaveRequest::with(['teacher.department', 'approver']);

        if (isset($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function create(array $data): LeaveRequest
    {
        return LeaveRequest::create($data);
    }

    public function update(int $id, array $data): ?LeaveRequest
    {
        $record = LeaveRequest::find($id);

        if ($record) {
            $record->update($data);
        }

        return $record;
    }

    public function delete(int $id): bool
    {
        return LeaveRequest::destroy($id) > 0;
    }

    public function getByTeacher(int $teacherId): Collection
    {
        return LeaveRequest::where('teacher_id', $teacherId)->orderByDesc('id')->get();
    }

    public function getPending(): Collection
    {
        return LeaveRequest::with(['teacher'])->where('status', 'pending')->orderByDesc('id')->get();
    }
}
