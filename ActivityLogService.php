<?php

namespace App\Services;

use App\Repositories\ActivityLogRepository;
use Illuminate\Http\Request;

class ActivityLogService
{
    public function __construct(private ActivityLogRepository $activityLogRepository)
    {
    }

    public function paginate(Request $request)
    {
        return $this->activityLogRepository->paginate(
            $request->only(['user_id', 'module', 'action']),
            $request->integer('per_page', 15),
        );
    }

    public function log(int $userId, string $module, string $action, string $description = null): void
    {
        $this->activityLogRepository->create([
            'user_id' => $userId,
            'module' => $module,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'browser' => request()->userAgent(),
            'device' => request()->header('User-Agent'),
        ]);
    }
}
