<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HolidayStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'holiday_name' => 'required|string|max:200',
            'holiday_date' => 'required|date',
            'description' => 'nullable|string',
        ];
    }
}
