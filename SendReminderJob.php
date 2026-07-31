<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\NotificationService;
use App\Models\User;

class SendReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId, public string $title, public string $message)
    {
    }

    public function handle(NotificationService $notificationService): void
    {
        $notificationService->sendToUser($this->userId, $this->title, $this->message, 'reminder');
    }
}
