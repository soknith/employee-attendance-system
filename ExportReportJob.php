<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\ReportService;

class ExportReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public array $params = [])
    {
    }

    public function handle(ReportService $reportService): void
    {
        $format = $this->params['format'] ?? 'excel';

        if ($format === 'pdf') {
            $reportService->exportPdf($this->params);
        } else {
            $reportService->exportExcel($this->params);
        }
    }
}
