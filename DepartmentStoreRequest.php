<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name_kh' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ];
    }
}
