<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AcademicYearStoreRequest;
use App\Http\Requests\AcademicYearUpdateRequest;
use App\Http\Resources\AcademicYearResource;
use App\Services\AcademicYearService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private AcademicYearService $academicYearService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $years = $this->academicYearService->paginate($request);

        return $this->paginateResponse($years, 'Academic years retrieved');
    }

    public function store(AcademicYearStoreRequest $request): JsonResponse
    {
        $year = $this->academicYearService->create($request->validated());

        return $this->successResponse(new AcademicYearResource($year), 'Academic year created', 201);
    }

    public function update(AcademicYearUpdateRequest $request, int $id): JsonResponse
    {
        $year = $this->academicYearService->update($id, $request->validated());

        if (!$year) {
            return $this->errorResponse('Academic year not found', 404);
        }

        return $this->successResponse(new AcademicYearResource($year), 'Academic year updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->academicYearService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Academic year not found', 404);
        }

        return $this->successResponse(null, 'Academic year deleted');
    }
}
