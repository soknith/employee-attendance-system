<?php

namespace App\Events;

class ProfileUpdated
{
    public function __construct(public int $userId)
    {
    }
}
