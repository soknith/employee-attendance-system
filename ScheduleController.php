<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleStoreRequest;
use App\Http\Requests\ScheduleUpdateRequest;
use App\Http\Resources\ScheduleResource;
use App\Services\ScheduleService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ScheduleService $scheduleService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $schedules = $this->scheduleService->paginate($request);

        return $this->paginateResponse($schedules, 'Schedules retrieved');
    }

    public function store(ScheduleStoreRequest $request): JsonResponse
    {
        $schedule = $this->scheduleService->create($request->validated());

        return $this->successResponse(new ScheduleResource($schedule), 'Schedule created', 201);
    }

    public function update(ScheduleUpdateRequest $request, int $id): JsonResponse
    {
        $schedule = $this->scheduleService->update($id, $request->validated());

        if (!$schedule) {
            return $this->errorResponse('Schedule not found', 404);
        }

        return $this->successResponse(new ScheduleResource($schedule), 'Schedule updated');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->scheduleService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Schedule not found', 404);
        }

        return $this->successResponse(null, 'Schedule deleted');
    }
}
