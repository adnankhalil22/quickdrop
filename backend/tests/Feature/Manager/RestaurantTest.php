<?php

namespace Tests\Feature\Manager;

use App\Models\Restaurant;
use Tests\TestCase;

class RestaurantTest extends TestCase
{
    public function test_a_manager_with_no_assigned_restaurant_gets_a_404(): void
    {
        $manager = $this->manager();

        $this->actingAsUser($manager)
            ->getJson('/api/manager/restaurant')
            ->assertNotFound();
    }

    public function test_a_manager_can_view_their_assigned_restaurant(): void
    {
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => $manager->id, 'name' => 'My Diner']);

        $this->actingAsUser($manager)
            ->getJson('/api/manager/restaurant')
            ->assertOk()
            ->assertJsonPath('restaurant.id', $restaurant->id);
    }

    public function test_a_manager_can_update_their_restaurant(): void
    {
        $manager = $this->manager();
        Restaurant::factory()->create(['manager_id' => $manager->id]);

        $response = $this->actingAsUser($manager)->putJson('/api/manager/restaurant', [
            'name' => 'New Name',
            'address' => '1 New St',
            'opening_time' => '08:00',
            'closing_time' => '22:00',
            'delivery_fee' => 2,
            'minimum_order' => 5,
        ]);

        $response->assertOk()->assertJsonPath('restaurant.name', 'New Name');
    }

    public function test_a_manager_cannot_change_their_restaurants_active_status(): void
    {
        $manager = $this->manager();
        Restaurant::factory()->create(['manager_id' => $manager->id, 'is_active' => true]);

        $this->actingAsUser($manager)->putJson('/api/manager/restaurant', [
            'name' => 'X',
            'address' => 'x',
            'opening_time' => '08:00',
            'closing_time' => '22:00',
            'delivery_fee' => 1,
            'minimum_order' => 1,
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('restaurants', ['manager_id' => $manager->id, 'is_active' => true]);
    }
}