<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ProfileService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private ProfileService $profileService)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $profile = $this->profileService->getProfile($request->user());

        return $this->successResponse($profile, 'Profile retrieved');
    }

    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $profile = $this->profileService->updateProfile($request->user(), $request->validated());

        return $this->successResponse($profile, 'Profile updated');
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate(['photo' => 'required|image|mimes:jpg,jpeg,png|max:2048']);

        $profile = $this->profileService->uploadPhoto($request->user(), $request->file('photo'));

        return $this->successResponse($profile, 'Photo uploaded');
    }

    public function deletePhoto(Request $request): JsonResponse
    {
        $profile = $this->profileService->deletePhoto($request->user());

        return $this->successResponse($profile, 'Photo deleted');
    }

    public function changePassword(PasswordUpdateRequest $request): JsonResponse
    {
        $result = $this->profileService->changePassword($request->user(), $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(null, 'Password changed successfully');
    }
}
