<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_name_kh',
        'school_name_en',
        'school_logo',
        'school_address',
        'phone',
        'email',
        'website',
        'latitude',
        'longitude',
        'attendance_radius',
        'morning_checkin_start',
        'morning_checkin_end',
        'afternoon_checkin_start',
        'afternoon_checkin_end',
        'language',
        'theme',
        'timezone',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'morning_checkin_start' => 'datetime:H:i',
            'morning_checkin_end' => 'datetime:H:i',
            'afternoon_checkin_start' => 'datetime:H:i',
            'afternoon_checkin_end' => 'datetime:H:i',
        ];
    }
}
