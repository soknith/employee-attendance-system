<?php

namespace App\Repositories;

use App\Models\Holiday;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class HolidayRepository
{
    public function find(int $id): ?Holiday
    {
        return Holiday::find($id);
    }

    public function all(): Collection
    {
        return Holiday::orderBy('holiday_date')->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Holiday::orderBy('holiday_date')->paginate($perPage);
    }

    public function create(array $data): Holiday
    {
        return Holiday::create($data);
    }

    public function update(int $id, array $data): ?Holiday
    {
        $holiday = Holiday::find($id);

        if ($holiday) {
            $holiday->update($data);
        }

        return $holiday;
    }

    public function delete(int $id): bool
    {
        return Holiday::destroy($id) > 0;
    }

    public function isHoliday(string $date): bool
    {
        return Holiday::where('holiday_date', $date)->exists();
    }
}
