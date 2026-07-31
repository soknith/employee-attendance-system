<?php

namespace App\Services;

use App\Repositories\AttendanceRepository;
use App\Repositories\TeacherRepository;
use App\Repositories\DepartmentRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private TeacherRepository $teacherRepository,
        private DepartmentRepository $departmentRepository,
    ) {
    }

    public function dailyReport(?string $date): array
    {
        $date = $date ?? today()->toDateString();

        $records = $this->attendanceRepository->getByDate($date);

        return [
            'type' => 'daily',
            'date' => $date,
            'total_teachers' => $this->teacherRepository->countByStatus(true),
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'leave' => $records->where('status', 'leave')->count(),
            'holiday' => $records->where('status', 'holiday')->count(),
            'records' => $records,
        ];
    }

    public function weeklyReport(?int $week, ?int $year): array
    {
        $year = $year ?? now()->year;
        $week = $week ?? now()->weekOfYear;

        $startOfWeek = Carbon::now()->setYear($year)->setWeek($week)->startOfWeek();
        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        $records = $this->attendanceRepository->getByDateRange(
            $startOfWeek->toDateString(),
            $endOfWeek->toDateString(),
        );

        return [
            'type' => 'weekly',
            'week' => $week,
            'year' => $year,
            'start_date' => $startOfWeek->toDateString(),
            'end_date' => $endOfWeek->toDateString(),
            'total_records' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'leave' => $records->where('status', 'leave')->count(),
            'records' => $records->groupBy('attendance_date'),
        ];
    }

    public function monthlyReport(?int $month, ?int $year): array
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $records = $this->attendanceRepository->getByDateRange(
            $startOfMonth->toDateString(),
            $endOfMonth->toDateString(),
        );

        return [
            'type' => 'monthly',
            'month' => $month,
            'year' => $year,
            'total_records' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'leave' => $records->where('status', 'leave')->count(),
            'daily_breakdown' => $records->groupBy('attendance_date'),
        ];
    }

    public function yearlyReport(?int $year): array
    {
        $year = $year ?? now()->year;

        $startOfYear = Carbon::create($year, 1, 1);
        $endOfYear = $startOfYear->copy()->endOfYear();

        $records = $this->attendanceRepository->getByDateRange(
            $startOfYear->toDateString(),
            $endOfYear->toDateString(),
        );

        return [
            'type' => 'yearly',
            'year' => $year,
            'total_records' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'leave' => $records->where('status', 'leave')->count(),
            'monthly_breakdown' => $records->groupBy(function ($record) {
                return Carbon::parse($record->attendance_date)->month;
            }),
        ];
    }

    public function teacherReport(int $teacherId, ?int $month, ?int $year): array
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $records = $this->attendanceRepository->getByTeacherAndDateRange(
            $teacherId,
            $startOfMonth->toDateString(),
            $endOfMonth->toDateString(),
        );

        return [
            'type' => 'teacher',
            'teacher_id' => $teacherId,
            'month' => $month,
            'year' => $year,
            'total_days' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'leave' => $records->where('status', 'leave')->count(),
            'total_late_minutes' => $records->sum('late_minutes'),
            'total_working_hours' => $records->sum('working_hours'),
            'records' => $records,
        ];
    }

    public function departmentReport(int $departmentId, ?int $month, ?int $year): array
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $department = $this->departmentRepository->find($departmentId);
        $teacherIds = $department ? $department->teachers->pluck('id') : collect();

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $records = \App\Models\AttendanceRecord::whereIn('teacher_id', $teacherIds)
            ->whereBetween('attendance_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->with(['teacher'])
            ->get();

        return [
            'type' => 'department',
            'department_id' => $departmentId,
            'month' => $month,
            'year' => $year,
            'total_teachers' => $teacherIds->count(),
            'total_records' => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'leave' => $records->where('status', 'leave')->count(),
            'records' => $records,
        ];
    }

    public function exportPdf(array $params): array
    {
        $type = $params['type'] ?? 'daily';
        $data = match ($type) {
            'daily' => $this->dailyReport($params['date'] ?? null),
            'weekly' => $this->weeklyReport($params['week'] ?? null, $params['year'] ?? null),
            'monthly' => $this->monthlyReport($params['month'] ?? null, $params['year'] ?? null),
            'yearly' => $this->yearlyReport($params['year'] ?? null),
            default => $this->dailyReport(null),
        };

        $filename = "report_{$type}_" . now()->format('Y-m-d_His') . '.pdf';
        $path = storage_path('app/public/reports/' . $filename);

        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        $html = view('reports.pdf', ['data' => $data])->render();
        file_put_contents(str_replace('.pdf', '.html', $path), $html);

        return ['path' => str_replace('.pdf', '.html', $path), 'filename' => str_replace('.pdf', '.html', $filename)];
    }

    public function exportExcel(array $params): array
    {
        $type = $params['type'] ?? 'daily';
        $data = match ($type) {
            'daily' => $this->dailyReport($params['date'] ?? null),
            'monthly' => $this->monthlyReport($params['month'] ?? null, $params['year'] ?? null),
            'yearly' => $this->yearlyReport($params['year'] ?? null),
            default => $this->dailyReport(null),
        };

        $filename = "report_{$type}_" . now()->format('Y-m-d_His') . '.csv';
        $path = storage_path('app/public/reports/' . $filename);

        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        $handle = fopen($path, 'w');
        fputcsv($handle, ['Teacher', 'Date', 'Check In', 'Check Out', 'Status', 'Late Minutes', 'Working Hours']);

        foreach ($data['records'] ?? [] as $record) {
            if (is_array($record) || $record instanceof \Illuminate\Support\Collection) {
                continue;
            }
            fputcsv($handle, [
                $record->teacher?->full_name_en ?? 'N/A',
                $record->attendance_date,
                $record->check_in,
                $record->check_out,
                $record->status,
                $record->late_minutes,
                $record->working_hours,
            ]);
        }

        fclose($handle);

        return ['path' => $path, 'filename' => $filename];
    }
}
