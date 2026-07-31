<?php

namespace App\Repositories;

use App\Models\Department;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class DepartmentRepository
{
    public function find(int $id): ?Department
    {
        return Department::with(['teachers'])->find($id);
    }

    public function all(): Collection
    {
        return Department::orderBy('name_en')->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Department::withCount('teachers')->orderByDesc('id')->paginate($perPage);
    }

    public function create(array $data): Department
    {
        return Department::create($data);
    }

    public function update(int $id, array $data): ?Department
    {
        $department = Department::find($id);

        if ($department) {
            $department->update($data);
        }

        return $department;
    }

    public function delete(int $id): bool
    {
        return Department::destroy($id) > 0;
    }
}
