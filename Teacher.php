<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'department_id',
        'teacher_code',
        'first_name_kh',
        'last_name_kh',
        'first_name_en',
        'last_name_en',
        'gender',
        'date_of_birth',
        'phone',
        'email',
        'address',
        'photo',
        'position',
        'join_date',
        'employment_status',
        'gps_enabled',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'join_date' => 'date',
            'gps_enabled' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function gpsLogs(): HasMany
    {
        return $this->hasMany(GpsLog::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(TeachingSchedule::class);
    }

    public function getFullNameEnAttribute(): string
    {
        return trim(($this->first_name_en ?? '') . ' ' . ($this->last_name_en ?? ''));
    }

    public function getFullNameKhAttribute(): string
    {
        return trim(($this->first_name_kh ?? '') . ' ' . ($this->last_name_kh ?? ''));
    }
}
