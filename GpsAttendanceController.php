<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceCheckInRequest;
use App\Http\Requests\AttendanceCheckOutRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\GpsService;
use App\Services\AttendanceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GpsAttendanceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private GpsService $gpsService,
        private AttendanceService $attendanceService,
    ) {
    }

    public function checkIn(AttendanceCheckInRequest $request): JsonResponse
    {
        $result = $this->attendanceService->checkIn($request->user(), $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status'] ?? 422);
        }

        return $this->successResponse(new AttendanceResource($result['data']), $result['message'], 201);
    }

    public function checkOut(AttendanceCheckOutRequest $request): JsonResponse
    {
        $result = $this->attendanceService->checkOut($request->user(), $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status'] ?? 422);
        }

        return $this->successResponse(new AttendanceResource($result['data']), $result['message']);
    }

    public function verifyGps(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'accuracy' => 'nullable|numeric',
        ]);

        $result = $this->gpsService->verifyLocation(
            $request->decimal('latitude'),
            $request->decimal('longitude'),
            $request->decimal('accuracy', 2),
        );

        return $this->successResponse($result, 'GPS verification completed');
    }
}
