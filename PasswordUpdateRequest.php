<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PasswordUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|max:64|confirmed|regex:/[A-Z]/|regex:/[a-z]/|regex:/[0-9]/|regex:/[^A-Za-z0-9]/',
        ];
    }

    public function messages(): array
    {
        return [
            'password.regex' => 'Password must contain uppercase, lowercase, number, and special character.',
        ];
    }
}
