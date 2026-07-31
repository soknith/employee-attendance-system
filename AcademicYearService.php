<?php

namespace App\Services;

use App\Repositories\AcademicYearRepository;
use Illuminate\Http\Request;

class AcademicYearService
{
    public function __construct(private AcademicYearRepository $academicYearRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->academicYearRepository->paginate($request->integer('per_page', 15));
    }

    public function create(array $data)
    {
        if (isset($data['is_active']) && $data['is_active']) {
            \App\Models\AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        return $this->academicYearRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        if (isset($data['is_active']) && $data['is_active']) {
            \App\Models\AcademicYear::where('id', '!=', $id)->where('is_active', true)->update(['is_active' => false]);
        }

        return $this->academicYearRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->academicYearRepository->delete($id);
    }
}
