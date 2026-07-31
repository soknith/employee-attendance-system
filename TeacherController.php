<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherStoreRequest;
use App\Http\Requests\TeacherUpdateRequest;
use App\Http\Resources\TeacherResource;
use App\Services\TeacherService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private TeacherService $teacherService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $teachers = $this->teacherService->paginate($request);

        return $this->paginateResponse($teachers, 'Teachers retrieved');
    }

    public function show(int $id): JsonResponse
    {
        $teacher = $this->teacherService->find($id);

        if (!$teacher) {
            return $this->errorResponse('Teacher not found', 404);
        }

        return $this->successResponse(new TeacherResource($teacher), 'Teacher retrieved');
    }

    public function store(TeacherStoreRequest $request): JsonResponse
    {
        $teacher = $this->teacherService->create($request->validated());

        return $this->successResponse(new TeacherResource($teacher), 'Teacher created', 201);
    }

    public function update(TeacherUpdateRequest $request, int $id): JsonResponse
    {
        $teacher = $this->teacherService->update($id, $request->validated());

        if (!$teacher) {
            return $this->errorResponse('Teacher not found', 404);
        }

        return $this->successResponse(new TeacherResource($teacher), 'Teacher updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->teacherService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Teacher not found', 404);
        }

        return $this->successResponse(null, 'Teacher deleted');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|boolean']);
        $teacher = $this->teacherService->updateStatus($id, $request->boolean('status'));

        if (!$teacher) {
            return $this->errorResponse('Teacher not found', 404);
        }

        return $this->successResponse(new TeacherResource($teacher), 'Teacher status updated');
    }

    public function search(Request $request): JsonResponse
    {
        $teachers = $this->teacherService->search($request->get('q', ''));

        return $this->successResponse(TeacherResource::collection($teachers), 'Search results');
    }
}
