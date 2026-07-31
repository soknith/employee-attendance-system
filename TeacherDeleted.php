<?php

namespace App\Events;

class TeacherDeleted
{
    public function __construct(public int $teacherId)
    {
    }
}
