<?php

namespace Tests\Feature;

use App\Helpers\GpsHelper;
use Tests\TestCase;

class GpsHelperTest extends TestCase
{
    public function test_haversine_distance_returns_zero_for_same_point(): void
    {
        $distance = GpsHelper::haversineDistance(11.556373, 104.928209, 11.556373, 104.928209);

        $this->assertEquals(0.0, $distance);
    }

    public function test_haversine_distance_calculates_correctly(): void
    {
        $distance = GpsHelper::haversineDistance(11.556373, 104.928209, 11.556500, 104.928500);

        $this->assertGreaterThan(10, $distance);
        $this->assertLessThan(100, $distance);
    }

    public function test_is_accuracy_valid(): void
    {
        $this->assertTrue(GpsHelper::isAccuracyValid(20.0));
        $this->assertTrue(GpsHelper::isAccuracyValid(30.0));
        $this->assertFalse(GpsHelper::isAccuracyValid(50.0));
        $this->assertFalse(GpsHelper::isAccuracyValid(null));
    }

    public function test_is_inside_radius(): void
    {
        $this->assertTrue(GpsHelper::isInsideRadius(50, 100));
        $this->assertTrue(GpsHelper::isInsideRadius(100, 100));
        $this->assertFalse(GpsHelper::isInsideRadius(150, 100));
    }
}
