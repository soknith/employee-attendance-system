<?php

namespace App\Services;

use App\Helpers\GpsHelper;
use App\Repositories\SettingRepository;

class GpsService
{
    public function __construct(private SettingRepository $settingRepository)
    {
    }

    public function verifyLocation(float $latitude, float $longitude, ?float $accuracy = null): array
    {
        $settings = $this->settingRepository->getSettings();

        if (!$settings) {
            return [
                'valid' => false,
                'message' => 'School location not configured',
                'distance' => null,
                'radius' => null,
            ];
        }

        $distance = GpsHelper::haversineDistance(
            $latitude,
            $longitude,
            $settings->latitude,
            $settings->longitude,
        );

        $insideRadius = $distance <= $settings->attendance_radius;
        $accuracyValid = $accuracy === null || $accuracy <= 30;

        return [
            'valid' => $insideRadius && $accuracyValid,
            'inside_radius' => $insideRadius,
            'accuracy_valid' => $accuracyValid,
            'distance' => round($distance, 2),
            'radius' => $settings->attendance_radius,
            'message' => $insideRadius
                ? ($accuracyValid ? 'Inside school area' : 'GPS accuracy too low. Please move outside and try again.')
                : 'You are outside school area.',
        ];
    }

    public function getSchoolLocation(): array
    {
        $settings = $this->settingRepository->getSettings();

        if (!$settings) {
            return ['latitude' => null, 'longitude' => null, 'radius' => 100];
        }

        return [
            'latitude' => $settings->latitude,
            'longitude' => $settings->longitude,
            'radius' => $settings->attendance_radius,
        ];
    }
}
