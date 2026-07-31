<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceCheckInRequest;
use App\Http\Requests\AttendanceCheckOutRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\AttendanceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private AttendanceService $attendanceService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $records = $this->attendanceService->paginate($request);

        return $this->paginateResponse($records, 'Attendance records retrieved');
    }

    public function today(Request $request): JsonResponse
    {
        $record = $this->attendanceService->getTodayRecord($request->user());

        return $this->successResponse($record ? new AttendanceResource($record) : null, 'Today attendance retrieved');
    }

    public function history(Request $request): JsonResponse
    {
        $records = $this->attendanceService->getHistory($request->user(), $request);

        return $this->paginateResponse($records, 'Attendance history retrieved');
    }

    public function show(int $id): JsonResponse
    {
        $record = $this->attendanceService->find($id);

        if (!$record) {
            return $this->errorResponse('Attendance record not found', 404);
        }

        return $this->successResponse(new AttendanceResource($record), 'Attendance record retrieved');
    }

    public function checkIn(AttendanceCheckInRequest $request): JsonResponse
    {
        $result = $this->attendanceService->checkIn($request->user(), $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status'] ?? 400);
        }

        return $this->successResponse($result['data'], $result['message'] ?? 'Check-in successful');
    }

    public function checkOut(AttendanceCheckOutRequest $request): JsonResponse
    {
        $result = $this->attendanceService->checkOut($request->user(), $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status'] ?? 400);
        }

        return $this->successResponse($result['data'], $result['message'] ?? 'Check-out successful');
    }

    public function statistics(Request $request): JsonResponse
    {
        $stats = $this->attendanceService->getStatistics($request);

        return $this->successResponse($stats, 'Attendance statistics retrieved');
    }
}
