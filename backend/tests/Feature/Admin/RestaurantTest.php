<?php

namespace Tests\Feature\Admin;

use App\Models\Restaurant;
use Tests\TestCase;

class RestaurantTest extends TestCase
{
    private function validRestaurant(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Diner',
            'address' => '1 Test St',
            'opening_time' => '08:00',
            'closing_time' => '20:00',
            'delivery_fee' => 2,
            'minimum_order' => 5,
        ], $overrides);
    }

    public function test_an_admin_can_create_a_restaurant(): void
    {
        $admin = $this->admin();

        $response = $this->actingAsUser($admin)->postJson('/api/admin/restaurants', $this->validRestaurant());

        $response->assertCreated()->assertJsonPath('restaurant.is_active', true);
    }

    public function test_an_admin_can_assign_a_manager_to_a_restaurant(): void
    {
        $admin = $this->admin();
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => null]);

        $response = $this->actingAsUser($admin)->putJson("/api/admin/restaurants/{$restaurant->id}", $this->validRestaurant([
            'manager_id' => $manager->id,
            'is_active' => true,
        ]));

        $response->assertOk()->assertJsonPath('restaurant.id', $restaurant->id);
        $this->assertDatabaseHas('restaurants', ['id' => $restaurant->id, 'manager_id' => $manager->id]);
    }

    public function test_a_manager_cannot_be_assigned_to_two_restaurants(): void
    {
        $admin = $this->admin();
        $manager = $this->manager();
        Restaurant::factory()->create(['manager_id' => $manager->id]);
        $secondRestaurant = Restaurant::factory()->create(['manager_id' => null]);

        $response = $this->actingAsUser($admin)->putJson("/api/admin/restaurants/{$secondRestaurant->id}", $this->validRestaurant([
            'manager_id' => $manager->id,
            'is_active' => true,
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors('manager_id');
    }

    public function test_reassigning_a_manager_to_their_own_restaurant_is_allowed(): void
    {
        $admin = $this->admin();
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => $manager->id]);

        $response = $this->actingAsUser($admin)->putJson("/api/admin/restaurants/{$restaurant->id}", $this->validRestaurant([
            'manager_id' => $manager->id,
            'is_active' => true,
        ]));

        $response->assertOk();
    }

    public function test_deactivating_a_restaurant_hides_it_from_the_public_listing(): void
    {
        $admin = $this->admin();
        $restaurant = Restaurant::factory()->create(['is_active' => true]);

        $this->actingAsUser($admin)->putJson("/api/admin/restaurants/{$restaurant->id}", $this->validRestaurant([
            'is_active' => false,
        ]))->assertOk();

        $this->getJson('/api/restaurants')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAsUser($admin)->getJson('/api/admin/restaurants')->assertOk()->assertJsonCount(1, 'data');
    }
}