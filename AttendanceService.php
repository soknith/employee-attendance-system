<?php

namespace App\Services;

use App\Events\AttendanceCheckedIn;
use App\Events\AttendanceCheckedOut;
use App\Helpers\GpsHelper;
use App\Models\User;
use App\Repositories\AttendanceRepository;
use App\Repositories\GpsRepository;
use App\Repositories\SettingRepository;
use App\Repositories\TeacherRepository;
use App\Repositories\HolidayRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AttendanceService
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private GpsRepository $gpsRepository,
        private SettingRepository $settingRepository,
        private TeacherRepository $teacherRepository,
        private HolidayRepository $holidayRepository,
    ) {
    }

    public function paginate(Request $request)
    {
        return $this->attendanceRepository->paginate($request->only(['teacher_id', 'department_id', 'status', 'date', 'from_date', 'to_date']), $request->integer('per_page', 15));
    }

    public function find(int $id)
    {
        return $this->attendanceRepository->find($id);
    }

    public function getTodayRecord(User $user)
    {
        if (!$user->teacher_id) {
            return null;
        }

        return $this->attendanceRepository->findTodayByTeacher($user->teacher_id);
    }

    public function getHistory(User $user, Request $request)
    {
        if (!$user->teacher_id) {
            return collect()->paginate(15);
        }

        return $this->attendanceRepository->getHistoryByTeacher($user->teacher_id, $request->integer('per_page', 15));
    }

    public function checkIn(User $user, array $data): array
    {
        if (!$user->teacher_id) {
            return ['success' => false, 'message' => 'No teacher profile linked', 'status' => 422];
        }

        $teacher = $this->teacherRepository->find($user->teacher_id);

        if (!$teacher || !$teacher->gps_enabled) {
            return ['success' => false, 'message' => 'GPS attendance is disabled for this teacher', 'status' => 422];
        }

        $existing = $this->attendanceRepository->findTodayByTeacher($teacher->id);

        if ($existing && $existing->check_in) {
            return ['success' => false, 'message' => 'You have already checked in today', 'status' => 409];
        }

        $settings = $this->settingRepository->getSettings();

        if (!$settings) {
            return ['success' => false, 'message' => 'School settings not configured', 'status' => 422];
        }

        $distance = GpsHelper::haversineDistance(
            $data['latitude'],
            $data['longitude'],
            $settings->latitude,
            $settings->longitude,
        );

        if ($distance > $settings->attendance_radius) {
            $this->gpsRepository->create([
                'teacher_id' => $teacher->id,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'accuracy' => $data['accuracy'] ?? null,
                'distance' => $distance,
                'radius' => $settings->attendance_radius,
                'gps_status' => 'failed',
                'device' => $data['device_name'] ?? null,
                'browser' => $data['browser'] ?? null,
                'ip_address' => request()->ip(),
                'message' => 'Outside school radius',
            ]);

            return ['success' => false, 'message' => 'You are outside school area.', 'status' => 422];
        }

        $now = Carbon::now();
        $status = $this->determineStatus($now);

        if ($status === 'closed') {
            return ['success' => false, 'message' => 'Check-in is closed for this session', 'status' => 422];
        }

        $lateMinutes = 0;

        if ($status === 'late') {
            $lateMinutes = $this->calculateLateMinutes($now);
        }

        return DB::transaction(function () use ($teacher, $data, $distance, $settings, $status, $lateMinutes) {
            $record = $this->attendanceRepository->create([
                'teacher_id' => $teacher->id,
                'attendance_date' => today(),
                'check_in' => now(),
                'status' => $status,
                'late_minutes' => $lateMinutes,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'accuracy' => $data['accuracy'] ?? null,
                'distance' => $distance,
                'device_name' => $data['device_name'] ?? null,
                'browser' => $data['browser'] ?? null,
                'operating_system' => $data['operating_system'] ?? null,
                'internet_status' => $data['internet_status'] ?? 'online',
            ]);

            $this->gpsRepository->create([
                'teacher_id' => $teacher->id,
                'attendance_record_id' => $record->id,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'accuracy' => $data['accuracy'] ?? null,
                'distance' => $distance,
                'radius' => $settings->attendance_radius,
                'gps_status' => 'success',
                'device' => $data['device_name'] ?? null,
                'browser' => $data['browser'] ?? null,
                'ip_address' => request()->ip(),
                'network' => $data['network'] ?? null,
                'battery_level' => $data['battery_level'] ?? null,
                'message' => 'Check-in GPS verified',
            ]);

            event(new AttendanceCheckedIn($record->id, $teacher->id));

            return ['success' => true, 'data' => $record->fresh(['teacher.department']), 'message' => 'Check-in successful'];
        });
    }

    public function checkOut(User $user, array $data): array
    {
        if (!$user->teacher_id) {
            return ['success' => false, 'message' => 'No teacher profile linked', 'status' => 422];
        }

        $record = $this->attendanceRepository->findTodayByTeacher($user->teacher_id);

        if (!$record || !$record->check_in) {
            return ['success' => false, 'message' => 'You must check in first', 'status' => 422];
        }

        if ($record->check_out) {
            return ['success' => false, 'message' => 'You have already checked out today', 'status' => 409];
        }

        $settings = $this->settingRepository->getSettings();

        $distance = GpsHelper::haversineDistance(
            $data['latitude'],
            $data['longitude'],
            $settings->latitude,
            $settings->longitude,
        );

        if ($distance > $settings->attendance_radius) {
            return ['success' => false, 'message' => 'You are outside school area.', 'status' => 422];
        }

        $checkIn = Carbon::parse($record->check_in);
        $checkOut = Carbon::now();
        $workingHours = $checkIn->diffInMinutes($checkOut) / 60;

        return DB::transaction(function () use ($record, $data, $distance, $workingHours) {
            $updated = $this->attendanceRepository->update($record->id, [
                'check_out' => now(),
                'working_hours' => round($workingHours, 2),
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'accuracy' => $data['accuracy'] ?? null,
                'distance' => $distance,
            ]);

            $this->gpsRepository->create([
                'teacher_id' => $record->teacher_id,
                'attendance_record_id' => $record->id,
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'accuracy' => $data['accuracy'] ?? null,
                'distance' => $distance,
                'gps_status' => 'success',
                'device' => $data['device_name'] ?? null,
                'browser' => $data['browser'] ?? null,
                'ip_address' => request()->ip(),
                'message' => 'Check-out GPS verified',
            ]);

            event(new AttendanceCheckedOut($record->id, $record->teacher_id));

            return ['success' => true, 'data' => $updated->fresh(['teacher.department']), 'message' => 'Check-out successful'];
        });
    }

    public function getStatistics(Request $request): array
    {
        $date = $request->get('date', today()->toDateString());

        return [
            'date' => $date,
            'present' => $this->attendanceRepository->countByStatusAndDate('present', $date),
            'late' => $this->attendanceRepository->countByStatusAndDate('late', $date),
            'absent' => $this->attendanceRepository->countByStatusAndDate('absent', $date),
            'leave' => $this->attendanceRepository->countByStatusAndDate('leave', $date),
            'holiday' => $this->attendanceRepository->countByStatusAndDate('holiday', $date),
            'total_teachers' => $this->teacherRepository->countByStatus(true),
        ];
    }

    public function getDashboardData(User $user): array
    {
        $today = today()->toDateString();

        if ($user->isTeacher()) {
            $todayRecord = $user->teacher_id ? $this->attendanceRepository->findTodayByTeacher($user->teacher_id) : null;

            return [
                'type' => 'teacher',
                'today_attendance' => $todayRecord,
                'is_checked_in' => $todayRecord && $todayRecord->check_in !== null,
                'is_checked_out' => $todayRecord && $todayRecord->check_out !== null,
            ];
        }

        return [
            'type' => 'admin',
            'total_teachers' => $this->teacherRepository->countByStatus(true),
            'present' => $this->attendanceRepository->countByStatusAndDate('present', $today),
            'late' => $this->attendanceRepository->countByStatusAndDate('late', $today),
            'absent' => $this->attendanceRepository->countByStatusAndDate('absent', $today),
            'leave' => $this->attendanceRepository->countByStatusAndDate('leave', $today),
        ];
    }

    private function determineStatus(Carbon $time): string
    {
        $settings = $this->settingRepository->getSettings();

        $morningStart = Carbon::createFromTimeString($settings->morning_checkin_start->format('H:i:s'));
        $morningEnd = Carbon::createFromTimeString($settings->morning_checkin_end->format('H:i:s'));
        $afternoonStart = Carbon::createFromTimeString($settings->afternoon_checkin_start->format('H:i:s'));
        $afternoonEnd = Carbon::createFromTimeString($settings->afternoon_checkin_end->format('H:i:s'));

        $morningLateThreshold = $morningStart->copy()->addMinutes(15);
        $afternoonLateThreshold = $afternoonStart->copy()->addMinutes(15);

        if ($time >= $morningStart && $time <= $morningLateThreshold) {
            return 'present';
        }

        if ($time > $morningLateThreshold && $time <= $morningEnd) {
            return 'late';
        }

        if ($time >= $afternoonStart && $time <= $afternoonLateThreshold) {
            return 'present';
        }

        if ($time > $afternoonLateThreshold && $time <= $afternoonEnd) {
            return 'late';
        }

        return 'closed';
    }

    private function calculateLateMinutes(Carbon $time): int
    {
        $settings = $this->settingRepository->getSettings();

        $morningStart = Carbon::createFromTimeString($settings->morning_checkin_start->format('H:i:s'));
        $morningLateThreshold = $morningStart->copy()->addMinutes(15);
        $afternoonStart = Carbon::createFromTimeString($settings->afternoon_checkin_start->format('H:i:s'));
        $afternoonLateThreshold = $afternoonStart->copy()->addMinutes(15);

        if ($time > $morningLateThreshold && $time <= $morningStart->copy()->addHours(4)) {
            return $time->diffInMinutes($morningLateThreshold);
        }

        if ($time > $afternoonLateThreshold) {
            return $time->diffInMinutes($afternoonLateThreshold);
        }

        return 0;
    }
}
