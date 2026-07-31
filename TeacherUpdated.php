<?php

namespace App\Events;

class TeacherUpdated
{
    public function __construct(public int $teacherId)
    {
    }
}
