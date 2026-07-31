<?php

namespace App\Services;

use App\Repositories\TeacherRepository;
use Illuminate\Http\Request;

class TeacherService
{
    public function __construct(private TeacherRepository $teacherRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->teacherRepository->paginate(
            $request->only(['department_id', 'status', 'search']),
            $request->integer('per_page', 15),
        );
    }

    public function find(int $id)
    {
        return $this->teacherRepository->find($id);
    }

    public function create(array $data)
    {
        return $this->teacherRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->teacherRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->teacherRepository->delete($id);
    }

    public function updateStatus(int $id, bool $status)
    {
        return $this->teacherRepository->update($id, ['status' => $status]);
    }

    public function search(string $query)
    {
        return $this->teacherRepository->search($query);
    }
}
