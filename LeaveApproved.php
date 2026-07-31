<?php

namespace App\Events;

class LeaveApproved
{
    public function __construct(public int $leaveRequestId, public int $teacherId, public int $approvedBy)
    {
    }
}
