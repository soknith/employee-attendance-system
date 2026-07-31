<?php

namespace App\Events;

class PasswordChanged
{
    public function __construct(public int $userId)
    {
    }
}
