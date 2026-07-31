<?php

namespace App\Repositories;

use App\Models\TeachingSchedule;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ScheduleRepository
{
    public function find(int $id): ?TeachingSchedule
    {
        return TeachingSchedule::with(['teacher', 'academicYear'])->find($id);
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = TeachingSchedule::with(['teacher', 'academicYear']);

        if (isset($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }

        if (isset($filters['academic_year_id'])) {
            $query->where('academic_year_id', $filters['academic_year_id']);
        }

        if (isset($filters['day_of_week'])) {
            $query->where('day_of_week', $filters['day_of_week']);
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function create(array $data): TeachingSchedule
    {
        return TeachingSchedule::create($data);
    }

    public function update(int $id, array $data): ?TeachingSchedule
    {
        $schedule = TeachingSchedule::find($id);

        if ($schedule) {
            $schedule->update($data);
        }

        return $schedule;
    }

    public function delete(int $id): bool
    {
        return TeachingSchedule::destroy($id) > 0;
    }

    public function getByTeacher(int $teacherId): Collection
    {
        return TeachingSchedule::where('teacher_id', $teacherId)
            ->where('status', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }
}
