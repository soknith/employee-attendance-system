<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\NotificationRepository;
use Illuminate\Http\Request;

class NotificationService
{
    public function __construct(private NotificationRepository $notificationRepository)
    {
    }

    public function paginate(User $user, Request $request)
    {
        return $this->notificationRepository->paginate($user->id, $request->integer('per_page', 15));
    }

    public function create(array $data)
    {
        return $this->notificationRepository->create($data);
    }

    public function markAsRead(int $id)
    {
        return $this->notificationRepository->markAsRead($id);
    }

    public function markAllAsRead(User $user): void
    {
        $this->notificationRepository->markAllAsRead($user->id);
    }

    public function delete(int $id): bool
    {
        return $this->notificationRepository->delete($id);
    }

    public function countUnread(User $user): int
    {
        return $this->notificationRepository->countUnread($user->id);
    }

    public function sendToUser(int $userId, string $title, string $message, string $type = 'system'): void
    {
        $this->notificationRepository->create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
        ]);
    }
}
