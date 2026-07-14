<?php

namespace Database\Factories;

use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Restaurant>
 */
class RestaurantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $adjectives = ['Golden', 'Cedar', 'Sunset', 'Blue Basil', 'Copper', 'Olive Grove', 'Harbor', 'Maple'];
        $nouns = ['Kitchen', 'Table', 'Grill', 'Diner', 'Bites', 'Kettle', 'Pantry', 'Corner'];

        return [
            'manager_id' => null,
            'name' => fake()->randomElement($adjectives).' '.fake()->randomElement($nouns),
            'description' => fake()->sentence(12),
            'phone' => fake()->numerify('+961 1 ### ###'),
            'address' => fake()->streetAddress(),
            'image' => null,
            'opening_time' => '09:00',
            'closing_time' => '23:00',
            'delivery_fee' => fake()->randomElement([1.5, 2, 2.5, 3]),
            'minimum_order' => fake()->randomElement([5, 10, 15]),
            'is_active' => true,
        ];
    }
}
