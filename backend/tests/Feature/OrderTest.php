<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Tests\TestCase;

class OrderTest extends TestCase
{
    private function menuItem(array $restaurantOverrides = [], array $itemOverrides = []): MenuItem
    {
        $restaurant = Restaurant::factory()->create(array_merge(
            ['is_active' => true, 'delivery_fee' => 3, 'minimum_order' => 10],
            $restaurantOverrides
        ));
        $category = MenuCategory::factory()->for($restaurant)->create();

        return MenuItem::factory()->for($category, 'category')->create(array_merge(
            ['price' => 20, 'is_available' => true],
            $itemOverrides
        ));
    }

    private function customerWithCart(MenuItem $item, int $quantity = 1): User
    {
        $user = $this->customer();
        $this->actingAsUser($user)->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => $quantity,
        ]);

        return $user;
    }

    public function test_cannot_place_an_order_with_an_empty_cart(): void
    {
        $user = $this->customer();
        $address = Address::factory()->for($user)->create();

        $response = $this->actingAsUser($user)->postJson('/api/orders', ['address_id' => $address->id]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_cannot_place_an_order_below_the_restaurant_minimum(): void
    {
        $item = $this->menuItem(['minimum_order' => 100]);
        $user = $this->customerWithCart($item, 1);
        $address = Address::factory()->for($user)->create();

        $response = $this->actingAsUser($user)->postJson('/api/orders', ['address_id' => $address->id]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_cannot_place_an_order_using_another_customers_address(): void
    {
        $item = $this->menuItem();
        $user = $this->customerWithCart($item, 1);
        $otherAddress = Address::factory()->for($this->customer())->create();

        $response = $this->actingAsUser($user)->postJson('/api/orders', ['address_id' => $otherAddress->id]);

        $response->assertUnprocessable()->assertJsonValidationErrors('address_id');
    }

    public function test_placing_an_order_calculates_totals_on_the_backend_and_clears_the_cart(): void
    {
        $item = $this->menuItem([], ['price' => 20]);
        $user = $this->customerWithCart($item, 2);
        $address = Address::factory()->for($user)->create();

        $response = $this->actingAsUser($user)->postJson('/api/orders', [
            'address_id' => $address->id,
            'total' => 999999,
            'subtotal' => 999999,
        ]);

        $response->assertCreated()
            ->assertJsonPath('order.subtotal', '40.00')
            ->assertJsonPath('order.delivery_fee', '3.00')
            ->assertJsonPath('order.total', '43.00')
            ->assertJsonPath('order.status', 'pending');

        $this->assertDatabaseCount('carts', 0);
        $this->assertDatabaseHas('order_items', [
            'menu_item_id' => $item->id,
            'item_name' => $item->name,
            'unit_price' => 20,
            'quantity' => 2,
            'subtotal' => 40,
        ]);
    }

    public function test_cannot_place_an_order_if_a_cart_item_became_unavailable(): void
    {
        $item = $this->menuItem();
        $user = $this->customerWithCart($item, 1);
        $item->update(['is_available' => false]);
        $address = Address::factory()->for($user)->create();

        $this->actingAsUser($user)
            ->postJson('/api/orders', ['address_id' => $address->id])
            ->assertUnprocessable();
    }

    public function test_a_customer_can_view_their_own_order_history(): void
    {
        $item = $this->menuItem();
        $user = $this->customerWithCart($item, 1);
        $address = Address::factory()->for($user)->create();
        $this->actingAsUser($user)->postJson('/api/orders', ['address_id' => $address->id]);

        $this->actingAsUser($user)
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_a_customer_cannot_view_another_customers_order(): void
    {
        $item = $this->menuItem();
        $owner = $this->customerWithCart($item, 1);
        $address = Address::factory()->for($owner)->create();
        $order = $this->actingAsUser($owner)->postJson('/api/orders', ['address_id' => $address->id])->json('order');

        $intruder = $this->customer();
        $this->actingAsUser($intruder)
            ->getJson("/api/orders/{$order['id']}")
            ->assertForbidden();
    }

    public function test_a_customer_can_cancel_a_pending_order(): void
    {
        $item = $this->menuItem();
        $user = $this->customerWithCart($item, 1);
        $address = Address::factory()->for($user)->create();
        $order = $this->actingAsUser($user)->postJson('/api/orders', ['address_id' => $address->id])->json('order');

        $this->actingAsUser($user)
            ->postJson("/api/orders/{$order['id']}/cancel")
            ->assertOk()
            ->assertJsonPath('order.status', 'cancelled');
    }

    public function test_a_customer_cannot_cancel_an_order_that_is_no_longer_pending(): void
    {
        $item = $this->menuItem();
        $user = $this->customerWithCart($item, 1);
        $address = Address::factory()->for($user)->create();
        $order = $this->actingAsUser($user)->postJson('/api/orders', ['address_id' => $address->id])->json('order');

        Order::find($order['id'])->update(['status' => 'accepted']);

        $this->actingAsUser($user)
            ->postJson("/api/orders/{$order['id']}/cancel")
            ->assertUnprocessable();
    }
}