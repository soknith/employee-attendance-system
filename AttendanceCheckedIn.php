<?php

namespace App\Events;

class AttendanceCheckedIn
{
    public function __construct(public int $attendanceId, public int $teacherId)
    {
    }
}
