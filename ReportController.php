<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ReportService $reportService)
    {
    }

    public function daily(Request $request): JsonResponse
    {
        $data = $this->reportService->dailyReport($request->get('date'));

        return $this->successResponse($data, 'Daily report generated');
    }

    public function weekly(Request $request): JsonResponse
    {
        $data = $this->reportService->weeklyReport($request->get('week'), $request->get('year'));

        return $this->successResponse($data, 'Weekly report generated');
    }

    public function monthly(Request $request): JsonResponse
    {
        $data = $this->reportService->monthlyReport($request->get('month'), $request->get('year'));

        return $this->successResponse($data, 'Monthly report generated');
    }

    public function yearly(Request $request): JsonResponse
    {
        $data = $this->reportService->yearlyReport($request->get('year'));

        return $this->successResponse($data, 'Yearly report generated');
    }

    public function teacher(Request $request, int $teacherId): JsonResponse
    {
        $data = $this->reportService->teacherReport($teacherId, $request->get('month'), $request->get('year'));

        return $this->successResponse($data, 'Teacher report generated');
    }

    public function department(Request $request, int $departmentId): JsonResponse
    {
        $data = $this->reportService->departmentReport($departmentId, $request->get('month'), $request->get('year'));

        return $this->successResponse($data, 'Department report generated');
    }

    public function exportPdf(Request $request): BinaryFileResponse
    {
        $file = $this->reportService->exportPdf($request->all());

        return response()->download($file['path'], $file['filename'], [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $file = $this->reportService->exportExcel($request->all());

        return response()->download($file['path'], $file['filename'], [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
