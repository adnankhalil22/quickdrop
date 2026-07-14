<?php

namespace Database\Factories;

use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    /**
     * Real, verified food-dish photos (Foodish), used as demo menu item images.
     */
    private const IMAGES = [
        'https://foodish-api.com/images/pizza/pizza57.jpg',
        'https://foodish-api.com/images/burger/burger23.jpg',
        'https://foodish-api.com/images/pasta/pasta14.jpg',
        'https://foodish-api.com/images/dessert/dessert24.jpg',
        'https://foodish-api.com/images/rice/rice5.jpg',
        'https://foodish-api.com/images/biryani/biryani74.jpg',
        'https://foodish-api.com/images/dosa/dosa30.jpg',
        'https://foodish-api.com/images/samosa/samosa3.jpg',
        'https://foodish-api.com/images/idly/idly72.jpg',
        'https://foodish-api.com/images/butter-chicken/butter-chicken21.jpg',
    ];

    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->words(rand(2, 3), true)),
            'description' => fake()->sentence(10),
            'price' => fake()->randomFloat(2, 2, 25),
            'image' => fake()->randomElement(self::IMAGES),
            'is_available' => true,
        ];
    }

    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }
}
