<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'attendance_date',
        'check_in',
        'check_out',
        'status',
        'working_hours',
        'late_minutes',
        'remark',
        'latitude',
        'longitude',
        'accuracy',
        'distance',
        'device_name',
        'browser',
        'operating_system',
        'internet_status',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'check_in' => 'datetime',
            'check_out' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'accuracy' => 'decimal:2',
            'distance' => 'decimal:2',
            'working_hours' => 'decimal:2',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function gpsLogs()
    {
        return $this->hasMany(GpsLog::class);
    }
}
