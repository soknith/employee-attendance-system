<?php

namespace App\Repositories;

use App\Models\AcademicYear;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class AcademicYearRepository
{
    public function find(int $id): ?AcademicYear
    {
        return AcademicYear::find($id);
    }

    public function all(): Collection
    {
        return AcademicYear::orderByDesc('start_date')->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return AcademicYear::orderByDesc('start_date')->paginate($perPage);
    }

    public function create(array $data): AcademicYear
    {
        return AcademicYear::create($data);
    }

    public function update(int $id, array $data): ?AcademicYear
    {
        $year = AcademicYear::find($id);

        if ($year) {
            $year->update($data);
        }

        return $year;
    }

    public function delete(int $id): bool
    {
        return AcademicYear::destroy($id) > 0;
    }

    public function getActive(): ?AcademicYear
    {
        return AcademicYear::where('is_active', true)->first();
    }
}
