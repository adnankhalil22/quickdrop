<?php

namespace Tests\Feature;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use Tests\TestCase;

class CartTest extends TestCase
{
    private function menuItem(array $restaurantOverrides = [], array $itemOverrides = []): MenuItem
    {
        $restaurant = Restaurant::factory()->create(array_merge(['is_active' => true], $restaurantOverrides));
        $category = MenuCategory::factory()->for($restaurant)->create();

        return MenuItem::factory()->for($category, 'category')->create(array_merge(
            ['price' => 10, 'is_available' => true],
            $itemOverrides
        ));
    }

    public function test_a_customer_can_add_an_item_to_their_cart(): void
    {
        $item = $this->menuItem();
        $user = $this->customer();

        $response = $this->actingAsUser($user)->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 2,
        ]);

        $response->assertCreated()
            ->assertJsonPath('cart.subtotal', 20)
            ->assertJsonCount(1, 'cart.items');
    }

    public function test_adding_the_same_item_again_increments_quantity_instead_of_duplicating(): void
    {
        $item = $this->menuItem();
        $user = $this->customer();

        $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);
        $response = $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 2]);

        $response->assertCreated()->assertJsonCount(1, 'cart.items');
        $this->assertDatabaseHas('cart_items', ['menu_item_id' => $item->id, 'quantity' => 3]);
    }

    public function test_the_current_menu_item_price_is_snapshotted_into_the_cart_item(): void
    {
        $item = $this->menuItem([], ['price' => 15.50]);
        $user = $this->customer();

        $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);

        $this->assertDatabaseHas('cart_items', ['menu_item_id' => $item->id, 'unit_price' => 15.50]);
    }

    public function test_cannot_add_an_unavailable_item(): void
    {
        $item = $this->menuItem([], ['is_available' => false]);

        $response = $this->actingAsUser($this->customer())->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_cannot_add_an_item_from_an_inactive_restaurant(): void
    {
        $item = $this->menuItem(['is_active' => false]);

        $response = $this->actingAsUser($this->customer())->postJson('/api/cart/items', [
            'menu_item_id' => $item->id,
            'quantity' => 1,
        ]);

        $response->assertUnprocessable();
    }

    public function test_cannot_add_items_from_two_different_restaurants_to_the_same_cart(): void
    {
        $itemA = $this->menuItem();
        $itemB = $this->menuItem();
        $user = $this->customer();

        $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $itemA->id, 'quantity' => 1])
            ->assertCreated();

        $response = $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $itemB->id, 'quantity' => 1]);

        $response->assertStatus(409);
    }

    public function test_clearing_the_cart_allows_starting_a_new_cart_from_a_different_restaurant(): void
    {
        $itemA = $this->menuItem();
        $itemB = $this->menuItem();
        $user = $this->customer();

        $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $itemA->id, 'quantity' => 1]);
        $this->actingAsUser($user)->deleteJson('/api/cart')->assertOk();

        $this->actingAsUser($user)
            ->postJson('/api/cart/items', ['menu_item_id' => $itemB->id, 'quantity' => 1])
            ->assertCreated();
    }

    public function test_a_customer_can_update_a_cart_items_quantity(): void
    {
        $item = $this->menuItem();
        $user = $this->customer();
        $create = $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);
        $cartItemId = $create->json('cart.items.0.id');

        $response = $this->actingAsUser($user)->putJson("/api/cart/items/{$cartItemId}", ['quantity' => 5]);

        $response->assertOk()->assertJsonPath('cart.items.0.quantity', 5);
    }

    public function test_a_customer_cannot_modify_another_customers_cart_item(): void
    {
        $item = $this->menuItem();
        $owner = $this->customer();
        $create = $this->actingAsUser($owner)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);
        $cartItemId = $create->json('cart.items.0.id');

        $intruder = $this->customer();
        $this->actingAsUser($intruder)
            ->putJson("/api/cart/items/{$cartItemId}", ['quantity' => 5])
            ->assertForbidden();
    }

    public function test_removing_the_last_item_deletes_the_empty_cart(): void
    {
        $item = $this->menuItem();
        $user = $this->customer();
        $create = $this->actingAsUser($user)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);
        $cartItemId = $create->json('cart.items.0.id');

        $this->actingAsUser($user)->deleteJson("/api/cart/items/{$cartItemId}")->assertOk();

        $this->actingAsUser($user)->getJson('/api/cart')->assertOk()->assertJsonPath('cart', null);
        $this->assertDatabaseCount('carts', 0);
    }
}