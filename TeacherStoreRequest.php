<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeacherStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => 'nullable|exists:departments,id',
            'teacher_code' => 'required|string|unique:teachers,teacher_code',
            'first_name_kh' => 'required|string|max:100',
            'last_name_kh' => 'nullable|string|max:100',
            'first_name_en' => 'nullable|string|max:100',
            'last_name_en' => 'nullable|string|max:100',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'position' => 'nullable|string|max:100',
            'join_date' => 'nullable|date',
            'employment_status' => 'nullable|in:active,inactive,suspended,retired',
            'gps_enabled' => 'boolean',
            'status' => 'boolean',
        ];
    }
}
