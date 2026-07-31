<?php

namespace App\Services;

use App\Repositories\DepartmentRepository;
use Illuminate\Http\Request;

class DepartmentService
{
    public function __construct(private DepartmentRepository $departmentRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->departmentRepository->paginate($request->integer('per_page', 15));
    }

    public function find(int $id)
    {
        return $this->departmentRepository->find($id);
    }

    public function create(array $data)
    {
        return $this->departmentRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->departmentRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->departmentRepository->delete($id);
    }

    public function all()
    {
        return $this->departmentRepository->all();
    }
}
