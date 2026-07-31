<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceCheckOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric|min:0',
            'device_name' => 'nullable|string',
            'browser' => 'nullable|string',
            'operating_system' => 'nullable|string',
            'internet_status' => 'nullable|in:online,offline',
            'network' => 'nullable|string',
            'battery_level' => 'nullable|numeric|min:0|max:100',
        ];
    }
}
