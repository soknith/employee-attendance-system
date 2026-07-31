<?php

namespace Database\Seeders;

use App\Models\SchoolSetting;
use Illuminate\Database\Seeder;

class SchoolSettingSeeder extends Seeder
{
    public function run(): void
    {
        SchoolSetting::firstOrCreate(['id' => 1], [
            'school_name_kh' => 'សាលាបឋមសិក្សាសុវណ្ណគិរី',
            'school_name_en' => 'SovannKiri Primary School',
            'school_address' => 'Kampot Province, Cambodia',
            'phone' => '+855 00 000 000',
            'email' => 'info@sovannkiri.edu.kh',
            'website' => 'https://sovannkiri.edu.kh',
            'latitude' => 11.556373,
            'longitude' => 104.928209,
            'attendance_radius' => 150,
            'morning_checkin_start' => '07:00',
            'morning_checkin_end' => '11:00',
            'afternoon_checkin_start' => '13:00',
            'afternoon_checkin_end' => '17:00',
            'language' => 'en',
            'theme' => 'light',
            'timezone' => 'Asia/Phnom_Penh',
        ]);
    }
}
