<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_name_kh' => 'sometimes|required|string|max:200',
            'school_name_en' => 'sometimes|required|string|max:200',
            'school_logo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'school_address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|string|max:200',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'attendance_radius' => 'sometimes|required|integer|min:10|max:1000',
            'morning_checkin_start' => 'sometimes|required|date_format:H:i',
            'morning_checkin_end' => 'sometimes|required|date_format:H:i',
            'afternoon_checkin_start' => 'sometimes|required|date_format:H:i',
            'afternoon_checkin_end' => 'sometimes|required|date_format:H:i',
            'language' => 'nullable|in:en,km',
            'theme' => 'nullable|in:light,dark,auto',
            'timezone' => 'nullable|string|max:50',
        ];
    }
}
