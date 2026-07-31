<?php

namespace App\Repositories;

use App\Models\SchoolSetting;

class SettingRepository
{
    public function getSettings(): ?SchoolSetting
    {
        return SchoolSetting::first();
    }

    public function create(array $data): SchoolSetting
    {
        return SchoolSetting::create($data);
    }

    public function update(int $id, array $data): ?SchoolSetting
    {
        $settings = SchoolSetting::find($id);

        if ($settings) {
            $settings->update($data);
        }

        return $settings;
    }

    public function updateOrCreate(array $data): SchoolSetting
    {
        return SchoolSetting::updateOrCreate(['id' => 1], $data);
    }
}
