<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function __construct(private UserRepository $userRepository)
    {
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

    public function uploadPhoto(User $user, UploadedFile $photo): array
    {
        $path = $photo->store('profile-photos', 'public');

        if ($user->teacher && $user->teacher->photo) {
            Storage::disk('public')->delete($user->teacher->photo);
        }

        if ($user->teacher) {
            $user->teacher->update(['photo' => $path]);
        }

        return $user->fresh(['teacher.department', 'role'])->toArray();
    }

    public function deletePhoto(User $user): array
    {
        if ($user->teacher && $user->teacher->photo) {
            Storage::disk('public')->delete($user->teacher->photo);
            $user->teacher->update(['photo' => null]);
        }

        return $user->fresh(['teacher.department', 'role'])->toArray();
    }

    public function changePassword(User $user, array $data): array
    {
        if (!\Hash::check($data['current_password'], $user->password)) {
            return ['success' => false, 'message' => 'Current password is incorrect'];
        }

        $this->userRepository->update($user->id, ['password' => $data['password']]);

        return ['success' => true];
    }
}
