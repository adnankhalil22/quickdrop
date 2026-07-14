<?php

namespace Tests\Feature\Manager;

use App\Models\Address;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use Tests\TestCase;

class OrderTest extends TestCase
{
    private function pendingOrderFor(Restaurant $restaurant): Order
    {
        $category = MenuCategory::factory()->for($restaurant)->create();
        $item = MenuItem::factory()->for($category, 'category')->create(['price' => 20]);

        $customer = $this->customer();
        $this->actingAsUser($customer)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);
        $address = Address::factory()->for($customer)->create();
        $response = $this->actingAsUser($customer)->postJson('/api/orders', ['address_id' => $address->id]);

        return Order::find($response->json('order.id'));
    }

    public function test_a_manager_can_list_their_restaurants_orders(): void
    {
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => $manager->id, 'is_active' => true, 'minimum_order' => 0]);
        $this->pendingOrderFor($restaurant);

        $this->actingAsUser($manager)
            ->getJson('/api/manager/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_a_manager_cannot_view_another_restaurants_order(): void
    {
        $otherManager = $this->manager();
        $otherRestaurant = Restaurant::factory()->create(['manager_id' => $otherManager->id, 'is_active' => true, 'minimum_order' => 0]);
        $order = $this->pendingOrderFor($otherRestaurant);

        $manager = $this->manager();
        Restaurant::factory()->create(['manager_id' => $manager->id]);

        $this->actingAsUser($manager)
            ->getJson("/api/manager/orders/{$order->id}")
            ->assertForbidden();
    }

    public function test_a_manager_can_accept_a_pending_order(): void
    {
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => $manager->id, 'is_active' => true, 'minimum_order' => 0]);
        $order = $this->pendingOrderFor($restaurant);

        $response = $this->actingAsUser($manager)
            ->putJson("/api/manager/orders/{$order->id}/status", ['status' => 'accepted']);

        $response->assertOk()->assertJsonPath('order.status', 'accepted');
    }

    public function test_a_manager_cannot_skip_a_status_in_the_workflow(): void
    {
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => $manager->id, 'is_active' => true, 'minimum_order' => 0]);
        $order = $this->pendingOrderFor($restaurant);

        $response = $this->actingAsUser($manager)
            ->putJson("/api/manager/orders/{$order->id}/status", ['status' => 'preparing']);

        $response->assertUnprocessable();
    }

    public function test_a_manager_cannot_change_status_of_another_restaurants_order(): void
    {
        $otherManager = $this->manager();
        $otherRestaurant = Restaurant::factory()->create(['manager_id' => $otherManager->id, 'is_active' => true, 'minimum_order' => 0]);
        $order = $this->pendingOrderFor($otherRestaurant);

        $manager = $this->manager();
        Restaurant::factory()->create(['manager_id' => $manager->id]);

        $this->actingAsUser($manager)
            ->putJson("/api/manager/orders/{$order->id}/status", ['status' => 'accepted'])
            ->assertForbidden();
    }
}