<?php

namespace App\Repositories;

use App\Models\ActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogRepository
{
    public function create(array $data): ActivityLog
    {
        return ActivityLog::create($data);
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = ActivityLog::with(['user']);

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (isset($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }
}
