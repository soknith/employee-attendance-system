<?php

namespace App\Events;

class LeaveRequested
{
    public function __construct(public int $leaveRequestId, public int $teacherId)
    {
    }
}
