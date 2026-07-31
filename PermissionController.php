<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionStoreRequest;
use App\Http\Resources\PermissionResource;
use App\Services\PermissionService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private PermissionService $permissionService)
    {
    }

    public function index(): JsonResponse
    {
        $permissions = $this->permissionService->all();

        return $this->successResponse(PermissionResource::collection($permissions), 'Permissions retrieved');
    }

    public function store(PermissionStoreRequest $request): JsonResponse
    {
        $permission = $this->permissionService->create($request->validated());

        return $this->successResponse(new PermissionResource($permission), 'Permission created', 201);
    }

    public function update(PermissionStoreRequest $request, int $id): JsonResponse
    {
        $permission = $this->permissionService->update($id, $request->validated());

        if (!$permission) {
            return $this->errorResponse('Permission not found', 404);
        }

        return $this->successResponse(new PermissionResource($permission), 'Permission updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->permissionService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Permission not found', 404);
        }

        return $this->successResponse(null, 'Permission deleted');
    }
}
