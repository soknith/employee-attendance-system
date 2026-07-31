<?php

namespace App\Repositories;

use App\Models\AttendanceRecord;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class AttendanceRepository
{
    public function find(int $id): ?AttendanceRecord
    {
        return AttendanceRecord::with(['teacher.department'])->find($id);
    }

    public function findTodayByTeacher(int $teacherId): ?AttendanceRecord
    {
        return AttendanceRecord::where('teacher_id', $teacherId)
            ->where('attendance_date', today())
            ->first();
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = AttendanceRecord::with(['teacher.department']);

        if (isset($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }

        if (isset($filters['department_id'])) {
            $query->whereHas('teacher', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date'])) {
            $query->where('attendance_date', $filters['date']);
        }

        if (isset($filters['from_date'])) {
            $query->where('attendance_date', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('attendance_date', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('attendance_date')->paginate($perPage);
    }

    public function create(array $data): AttendanceRecord
    {
        return AttendanceRecord::create($data);
    }

    public function update(int $id, array $data): ?AttendanceRecord
    {
        $record = AttendanceRecord::find($id);

        if ($record) {
            $record->update($data);
        }

        return $record;
    }

    public function getHistoryByTeacher(int $teacherId, int $perPage = 15): LengthAwarePaginator
    {
        return AttendanceRecord::where('teacher_id', $teacherId)
            ->orderByDesc('attendance_date')
            ->paginate($perPage);
    }

    public function countByStatusAndDate(string $status, string $date): int
    {
        return AttendanceRecord::where('status', $status)
            ->where('attendance_date', $date)
            ->count();
    }

    public function getByDate(string $date): Collection
    {
        return AttendanceRecord::with(['teacher.department'])
            ->where('attendance_date', $date)
            ->get();
    }

    public function getByDateRange(string $from, string $to): Collection
    {
        return AttendanceRecord::with(['teacher.department'])
            ->whereBetween('attendance_date', [$from, $to])
            ->get();
    }

    public function getByTeacherAndDateRange(int $teacherId, string $from, string $to): Collection
    {
        return AttendanceRecord::where('teacher_id', $teacherId)
            ->whereBetween('attendance_date', [$from, $to])
            ->orderBy('attendance_date')
            ->get();
    }
}
