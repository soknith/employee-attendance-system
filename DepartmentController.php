<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepartmentStoreRequest;
use App\Http\Resources\DepartmentResource;
use App\Services\DepartmentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private DepartmentService $departmentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $departments = $this->departmentService->paginate($request);

        return $this->paginateResponse($departments, 'Departments retrieved');
    }

    public function show(int $id): JsonResponse
    {
        $department = $this->departmentService->find($id);

        if (!$department) {
            return $this->errorResponse('Department not found', 404);
        }

        return $this->successResponse(new DepartmentResource($department), 'Department retrieved');
    }

    public function store(DepartmentStoreRequest $request): JsonResponse
    {
        $department = $this->departmentService->create($request->validated());

        return $this->successResponse(new DepartmentResource($department), 'Department created', 201);
    }

    public function update(DepartmentStoreRequest $request, int $id): JsonResponse
    {
        $department = $this->departmentService->update($id, $request->validated());

        if (!$department) {
            return $this->errorResponse('Department not found', 404);
        }

        return $this->successResponse(new DepartmentResource($department), 'Department updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->departmentService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Department not found', 404);
        }

        return $this->successResponse(null, 'Department deleted');
    }
}
