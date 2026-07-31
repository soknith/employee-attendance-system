<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private NotificationService $notificationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->paginate($request->user(), $request);

        return $this->paginateResponse($notifications, 'Notifications retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin() && !$request->user()->isPrincipal()) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'message' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $notification = $this->notificationService->create($request->all());

        return $this->successResponse(new NotificationResource($notification), 'Notification created', 201);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $notification = $this->notificationService->markAsRead($id);

        if (!$notification) {
            return $this->errorResponse('Notification not found', 404);
        }

        return $this->successResponse(new NotificationResource($notification), 'Notification marked as read');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return $this->successResponse(null, 'All notifications marked as read');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->notificationService->delete($id);

        if (!$deleted) {
            return $this->errorResponse('Notification not found', 404);
        }

        return $this->successResponse(null, 'Notification deleted');
    }
}
