<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ActivityLogService $activityLogService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $logs = $this->activityLogService->paginate($request);

        return $this->paginateResponse($logs, 'Activity logs retrieved');
    }
}
