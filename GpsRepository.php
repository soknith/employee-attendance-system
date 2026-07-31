<?php

namespace App\Repositories;

use App\Models\GpsLog;
use Illuminate\Database\Eloquent\Collection;

class GpsRepository
{
    public function find(int $id): ?GpsLog
    {
        return GpsLog::find($id);
    }

    public function create(array $data): GpsLog
    {
        return GpsLog::create($data);
    }

    public function getByTeacher(int $teacherId, int $limit = 50): Collection
    {
        return GpsLog::where('teacher_id', $teacherId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getByAttendanceRecord(int $attendanceId): Collection
    {
        return GpsLog::where('attendance_record_id', $attendanceId)->get();
    }
}
