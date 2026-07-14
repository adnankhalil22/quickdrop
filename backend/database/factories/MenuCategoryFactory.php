<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuCategory>
 */
class MenuCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Starters', 'Burgers', 'Pizza', 'Salads', 'Sandwiches',
                'Pasta', 'Grilled', 'Desserts', 'Drinks', 'Sides',
            ]),
            'description' => fake()->optional()->sentence(8),
        ];
    }
}
