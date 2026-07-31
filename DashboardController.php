<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private AttendanceService $attendanceService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $data = $this->attendanceService->getDashboardData($request->user());

        return $this->successResponse($data, 'Dashboard data retrieved');
    }
}
