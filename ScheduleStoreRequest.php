<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_id' => 'required|exists:teachers,id',
            'subject' => 'required|string|max:100',
            'grade' => 'nullable|string|max:50',
            'classroom' => 'nullable|string|max:50',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'semester' => 'nullable|string|max:20',
            'status' => 'boolean',
        ];
    }
}
