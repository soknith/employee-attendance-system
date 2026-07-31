<?php

namespace App\Repositories;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationRepository
{
    public function find(int $id): ?Notification
    {
        return Notification::find($id);
    }

    public function paginate(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function markAsRead(int $id): ?Notification
    {
        $notification = Notification::find($id);

        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return $notification;
    }

    public function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)->where('is_read', false)->update(['is_read' => true]);
    }

    public function delete(int $id): bool
    {
        return Notification::destroy($id) > 0;
    }

    public function countUnread(int $userId): int
    {
        return Notification::where('user_id', $userId)->where('is_read', false)->count();
    }
}
