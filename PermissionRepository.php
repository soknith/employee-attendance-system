<?php

namespace App\Repositories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

class PermissionRepository
{
    public function find(int $id): ?Permission
    {
        return Permission::find($id);
    }

    public function all(): Collection
    {
        return Permission::orderBy('module')->orderBy('name')->get();
    }

    public function create(array $data): Permission
    {
        return Permission::create($data);
    }

    public function update(int $id, array $data): ?Permission
    {
        $permission = Permission::find($id);

        if ($permission) {
            $permission->update($data);
        }

        return $permission;
    }

    public function delete(int $id): bool
    {
        return Permission::destroy($id) > 0;
    }
}
