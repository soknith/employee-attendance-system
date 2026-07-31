<?php

namespace App\Helpers;

class GpsHelper
{
    public static function haversineDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2,
    ): float {
        $earthRadius = 6371000;

        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLon = deg2rad($lon2 - $lon1);

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
            cos($lat1Rad) * cos($lat2Rad) *
            sin($deltaLon / 2) * sin($deltaLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    public static function isAccuracyValid(?float $accuracy, float $threshold = 30.0): bool
    {
        if ($accuracy === null) {
            return false;
        }

        return $accuracy <= $threshold;
    }

    public static function isInsideRadius(float $distance, int $radius): bool
    {
        return $distance <= $radius;
    }

    public static function detectMockLocation(float $accuracy, ?float $speed = null): bool
    {
        if ($accuracy < 1) {
            return true;
        }

        if ($speed !== null && $speed > 100) {
            return true;
        }

        return false;
    }
}
