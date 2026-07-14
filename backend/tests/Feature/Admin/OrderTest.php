<?php

namespace Tests\Feature\Admin;

use App\Models\Address;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Restaurant;
use Tests\TestCase;

class OrderTest extends TestCase
{
    private function pendingOrder(): Order
    {
        $restaurant = Restaurant::factory()->create(['is_active' => true, 'minimum_order' => 0]);
        $category = MenuCategory::factory()->for($restaurant)->create();
        $item = MenuItem::factory()->for($category, 'category')->create(['price' => 20]);

        $customer = $this->customer();
        $this->actingAsUser($customer)->postJson('/api/cart/items', ['menu_item_id' => $item->id, 'quantity' => 1]);
        $address = Address::factory()->for($customer)->create();
        $response = $this->actingAsUser($customer)->postJson('/api/orders', ['address_id' => $address->id]);

        return Order::find($response->json('order.id'));
    }

    public function test_an_admin_can_view_orders_across_all_restaurants(): void
    {
        $this->pendingOrder();
        $this->pendingOrder();
        $admin = $this->admin();

        $this->actingAsUser($admin)
            ->getJson('/api/admin/orders')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_an_admin_can_override_cancel_a_pending_order(): void
    {
        $order = $this->pendingOrder();
        $admin = $this->admin();

        $response = $this->actingAsUser($admin)
            ->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled']);

        $response->assertOk()->assertJsonPath('order.status', 'cancelled');
    }

    public function test_an_admin_cannot_cancel_an_order_that_is_already_delivered(): void
    {
        $order = $this->pendingOrder();
        $order->update(['status' => 'delivered']);
        $admin = $this->admin();

        $this->actingAsUser($admin)
            ->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertUnprocessable();
    }

    public function test_an_admin_can_follow_the_normal_workflow_too(): void
    {
        $order = $this->pendingOrder();
        $admin = $this->admin();

        $this->actingAsUser($admin)
            ->putJson("/api/admin/orders/{$order->id}/status", ['status' => 'accepted'])
            ->assertOk()
            ->assertJsonPath('order.status', 'accepted');
    }
}