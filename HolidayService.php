<?php

namespace App\Services;

use App\Repositories\HolidayRepository;
use Illuminate\Http\Request;

class HolidayService
{
    public function __construct(private HolidayRepository $holidayRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->holidayRepository->paginate($request->integer('per_page', 15));
    }

    public function create(array $data)
    {
        return $this->holidayRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->holidayRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->holidayRepository->delete($id);
    }

    public function isHoliday(string $date): bool
    {
        return $this->holidayRepository->isHoliday($date);
    }
}
