<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HolidayStoreRequest;
use App\Http\Requests\HolidayUpdateRequest;
use App\Http\Resources\HolidayResource;
use App\Services\HolidayService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private HolidayService $holidayService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $holidays = $this->holidayService->paginate($request);

        return $this->paginateResponse($holidays, 'Holidays retrieved');
    }

    public function store(HolidayStoreRequest $request): JsonResponse
    {
        $holiday = $this->holidayService->create($request->validated());

        return $this->successResponse(new HolidayResource($holiday), 'Holiday created', 201);
    }

    public function update(HolidayUpdateRequest $request, int $id): JsonResponse
    {
        $holiday = $this->holidayService->update($id, $request->validated());

        if (!$holiday) {
            return $this->errorResponse('Holiday not found', 404);
        }

        return $this->successResponse(new HolidayResource($holiday), 'Holiday updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->holidayService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Holiday not found', 404);
        }

        return $this->successResponse(null, 'Holiday deleted');
    }
}
