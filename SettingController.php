<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingUpdateRequest;
use App\Services\SettingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private SettingService $settingService)
    {
    }

    public function index(): JsonResponse
    {
        $settings = $this->settingService->getSettings();

        return $this->successResponse($settings, 'Settings retrieved');
    }

    public function update(SettingUpdateRequest $request): JsonResponse
    {
        $settings = $this->settingService->updateSettings($request->validated());

        return $this->successResponse($settings, 'Settings updated');
    }

    public function updateGps(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'attendance_radius' => 'required|integer|min:10|max:1000',
        ]);

        $settings = $this->settingService->updateGpsSettings($request->only(['latitude', 'longitude', 'attendance_radius']));

        return $this->successResponse($settings, 'GPS settings updated');
    }

    public function updateTheme(Request $request): JsonResponse
    {
        $request->validate(['theme' => 'required|in:light,dark,auto']);

        $settings = $this->settingService->updateTheme($request->string('theme'));

        return $this->successResponse($settings, 'Theme updated');
    }

    public function updateLanguage(Request $request): JsonResponse
    {
        $request->validate(['language' => 'required|in:en,km']);

        $settings = $this->settingService->updateLanguage($request->string('language'));

        return $this->successResponse($settings, 'Language updated');
    }
}
