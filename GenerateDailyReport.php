<?php

namespace App\Listeners;

use App\Events\AttendanceCheckedOut;
use App\Services\ReportService;

class GenerateDailyReport
{
    public function __construct(private ReportService $reportService)
    {
    }

    public function handle(AttendanceCheckedOut $event): void
    {
        $this->reportService->dailyReport(today()->toDateString());
    }
}
