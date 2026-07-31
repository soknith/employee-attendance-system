<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HolidayUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'holiday_name' => 'sometimes|required|string|max:200',
            'holiday_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
        ];
    }
}
