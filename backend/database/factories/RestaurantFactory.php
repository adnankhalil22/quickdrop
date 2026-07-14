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
    /**
     * Real, verified restaurant/dining photos (Unsplash), used as demo cover images.
     */
    private const IMAGES = [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=900&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&q=70&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=900&q=70&auto=format&fit=crop',
    ];

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
            'image' => fake()->randomElement(self::IMAGES),
            'opening_time' => '09:00',
            'closing_time' => '23:00',
            'delivery_fee' => fake()->randomElement([1.5, 2, 2.5, 3]),
            'minimum_order' => fake()->randomElement([5, 10, 15]),
            'is_active' => true,
        ];
    }
}
