<?php

namespace App\Events;

class TeacherCreated
{
    public function __construct(public int $teacherId)
    {
    }
}
