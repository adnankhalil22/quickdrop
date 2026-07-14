<?php

namespace App\Http\Requests\Manager;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuItemRequest extends FormRequest
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
            'menu_category_id' => [
                'required',
                'integer',
                Rule::exists('menu_categories', 'id')->where('restaurant_id', $this->user()->restaurant->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'image' => ['nullable', 'string', 'max:2048'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }
}
