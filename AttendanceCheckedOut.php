<?php

namespace App\Events;

class AttendanceCheckedOut
{
    public function __construct(public int $attendanceId, public int $teacherId)
    {
    }
}
