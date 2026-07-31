<?php

namespace App\Services;

use App\Repositories\PermissionRepository;

class PermissionService
{
    public function __construct(private PermissionRepository $permissionRepository)
    {
    }

    public function all()
    {
        return $this->permissionRepository->all();
    }

    public function create(array $data)
    {
        return $this->permissionRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->permissionRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->permissionRepository->delete($id);
    }
}
