<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private AuthService $authService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], $result['status'] ?? 401);
        }

        return $this->successResponse($result['data'], 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse(null, 'Logout successful');
    }

    public function profile(Request $request): JsonResponse
    {
        $profile = $this->authService->getProfile($request->user());

        return $this->successResponse($profile, 'Profile retrieved');
    }

    public function updateProfile(ProfileUpdateRequest $request): JsonResponse
    {
        $profile = $this->authService->updateProfile($request->user(), $request->validated());

        return $this->successResponse($profile, 'Profile updated');
    }

    public function changePassword(PasswordUpdateRequest $request): JsonResponse
    {
        $result = $this->authService->changePassword($request->user(), $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(null, 'Password changed successfully');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        $this->authService->sendResetLink($request->email);

        return $this->successResponse(null, 'Password reset link sent');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $result = $this->authService->resetPassword($request->only(['email', 'token', 'password']));

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(null, 'Password reset successful');
    }
}
