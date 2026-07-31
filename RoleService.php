<?php

namespace App\Services;

use App\Repositories\RoleRepository;

class RoleService
{
    public function __construct(private RoleRepository $roleRepository)
    {
    }

    public function all()
    {
        return $this->roleRepository->all();
    }

    public function create(array $data)
    {
        return $this->roleRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->roleRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->roleRepository->delete($id);
    }

    public function syncPermissions(int $roleId, array $permissionIds): void
    {
        $this->roleRepository->syncPermissions($roleId, $permissionIds);
    }
}
