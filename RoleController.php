<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleStoreRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private RoleService $roleService)
    {
    }

    public function index(): JsonResponse
    {
        $roles = $this->roleService->all();

        return $this->successResponse(RoleResource::collection($roles), 'Roles retrieved');
    }

    public function store(RoleStoreRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return $this->successResponse(new RoleResource($role), 'Role created', 201);
    }

    public function update(RoleStoreRequest $request, int $id): JsonResponse
    {
        $role = $this->roleService->update($id, $request->validated());

        if (!$role) {
            return $this->errorResponse('Role not found', 404);
        }

        return $this->successResponse(new RoleResource($role), 'Role updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->roleService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Role not found', 404);
        }

        return $this->successResponse(null, 'Role deleted');
    }
}
