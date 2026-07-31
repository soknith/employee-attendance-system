<?php

namespace App\Events;

class LeaveRejected
{
    public function __construct(public int $leaveRequestId, public int $teacherId, public int $rejectedBy)
    {
    }
}
