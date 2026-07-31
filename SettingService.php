<?php

namespace App\Services;

use App\Repositories\SettingRepository;

class SettingService
{
    public function __construct(private SettingRepository $settingRepository)
    {
    }

    public function getSettings(): ?array
    {
        $settings = $this->settingRepository->getSettings();

        return $settings ? $settings->toArray() : null;
    }

    public function updateSettings(array $data): array
    {
        return $this->settingRepository->updateOrCreate($data)->toArray();
    }

    public function updateGpsSettings(array $data): array
    {
        $settings = $this->settingRepository->getSettings();

        if ($settings) {
            return $this->settingRepository->update($settings->id, $data)->toArray();
        }

        return $this->settingRepository->updateOrCreate($data)->toArray();
    }

    public function updateTheme(string $theme): array
    {
        return $this->settingRepository->updateOrCreate(['theme' => $theme])->toArray();
    }

    public function updateLanguage(string $language): array
    {
        return $this->settingRepository->updateOrCreate(['language' => $language])->toArray();
    }
}
