<?php

namespace Database\Factories;

use App\Models\Address;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => fake()->randomElement(['Home', 'Work', 'Other']),
            'city' => fake()->city(),
            'area' => fake()->streetName(),
            'street' => fake()->streetAddress(),
            'building' => (string) fake()->buildingNumber(),
            'floor' => fake()->optional()->numberBetween(1, 15),
            'details' => fake()->optional()->sentence(6),
            'is_default' => false,
        ];
    }
}
