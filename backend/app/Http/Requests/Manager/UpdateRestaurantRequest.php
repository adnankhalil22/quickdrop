<?php

namespace App\Http\Requests\Manager;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'opening_time' => ['required', 'date_format:H:i'],
            'closing_time' => ['required', 'date_format:H:i', 'after:opening_time'],
            'delivery_fee' => ['required', 'numeric', 'min:0'],
            'minimum_order' => ['required', 'numeric', 'min:0'],
        ];
    }
}
