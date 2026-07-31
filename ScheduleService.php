<?php

namespace App\Services;

use App\Repositories\ScheduleRepository;
use Illuminate\Http\Request;

class ScheduleService
{
    public function __construct(private ScheduleRepository $scheduleRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->scheduleRepository->paginate(
            $request->only(['teacher_id', 'academic_year_id', 'day_of_week']),
            $request->integer('per_page', 15),
        );
    }

    public function create(array $data)
    {
        return $this->scheduleRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->scheduleRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->scheduleRepository->delete($id);
    }

    public function getByTeacher(int $teacherId)
    {
        return $this->scheduleRepository->getByTeacher($teacherId);
    }
}
