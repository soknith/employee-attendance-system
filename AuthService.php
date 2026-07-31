<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\Repositories\ActivityLogRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
        private ActivityLogRepository $activityLogRepository,
    ) {
    }

    public function login(array $credentials): array
    {
        $user = $this->userRepository->findByUsername($credentials['username']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return ['success' => false, 'message' => 'Invalid credentials', 'status' => 401];
        }

        if ($user->status !== 'active') {
            return ['success' => false, 'message' => 'Account is not active', 'status' => 403];
        }

        $token = $user->createToken('auth-token', ['*'], now()->addHours(24))->plainTextToken;

        $this->userRepository->updateLastLogin($user, request()->ip());

        $this->activityLogRepository->create([
            'user_id' => $user->id,
            'module' => 'auth',
            'action' => 'login',
            'description' => 'User logged in',
            'ip_address' => request()->ip(),
            'browser' => request()->userAgent(),
            'device' => request()->header('User-Agent'),
        ]);

        return [
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $user->load(['teacher.department', 'role']),
            ],
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();

        $this->activityLogRepository->create([
            'user_id' => $user->id,
            'module' => 'auth',
            'action' => 'logout',
            'description' => 'User logged out',
            'ip_address' => request()->ip(),
            'browser' => request()->userAgent(),
            'device' => request()->header('User-Agent'),
        ]);
    }

    public function getProfile(User $user): array
    {
        return $user->load(['teacher.department', 'role'])->toArray();
    }

    public function updateProfile(User $user, array $data): array
    {
        $updated = $this->userRepository->update($user->id, $data);

        return $updated->load(['teacher.department', 'role'])->toArray();
    }

    public function changePassword(User $user, array $data): array
    {
        if (!Hash::check($data['current_password'], $user->password)) {
            return ['success' => false, 'message' => 'Current password is incorrect'];
        }

        $this->userRepository->update($user->id, [
            'password' => $data['password'],
        ]);

        $this->activityLogRepository->create([
            'user_id' => $user->id,
            'module' => 'auth',
            'action' => 'password_changed',
            'description' => 'User changed password',
            'ip_address' => request()->ip(),
            'browser' => request()->userAgent(),
            'device' => request()->header('User-Agent'),
        ]);

        return ['success' => true];
    }

    public function sendResetLink(string $email): void
    {
        Password::sendResetLink(['email' => $email]);
    }

    public function resetPassword(array $data): array
    {
        $status = Password::reset($data, function ($user, $password) {
            $user->password = $password;
            $user->save();
        });

        return $status === Password::PASSWORD_RESET
            ? ['success' => true]
            : ['success' => false, 'message' => 'Password reset failed'];
    }
}
