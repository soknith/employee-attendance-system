<?php

namespace App\Repositories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;

class RoleRepository
{
    public function find(int $id): ?Role
    {
        return Role::with(['permissions'])->find($id);
    }

    public function all(): Collection
    {
        return Role::with(['permissions'])->orderBy('id')->get();
    }

    public function findByName(string $name): ?Role
    {
        return Role::where('name', $name)->first();
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(int $id, array $data): ?Role
    {
        $role = Role::find($id);

        if ($role) {
            $role->update($data);
        }

        return $role;
    }

    public function delete(int $id): bool
    {
        return Role::destroy($id) > 0;
    }

    public function syncPermissions(int $roleId, array $permissionIds): void
    {
        $role = Role::find($roleId);

        if ($role) {
            $role->permissions()->sync($permissionIds);
        }
    }
}
