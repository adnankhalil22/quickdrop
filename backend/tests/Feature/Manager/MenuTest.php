<?php

namespace Tests\Feature\Manager;

use App\Models\MenuCategory;
use App\Models\Restaurant;
use App\Models\User;
use Tests\TestCase;

class MenuTest extends TestCase
{
    private function managerWithRestaurant(): array
    {
        $manager = $this->manager();
        $restaurant = Restaurant::factory()->create(['manager_id' => $manager->id]);

        return [$manager, $restaurant];
    }

    public function test_a_manager_can_create_a_menu_category(): void
    {
        [$manager] = $this->managerWithRestaurant();

        $response = $this->actingAsUser($manager)->postJson('/api/manager/categories', [
            'name' => 'Desserts',
        ]);

        $response->assertCreated()->assertJsonPath('category.name', 'Desserts');
    }

    public function test_a_manager_cannot_view_another_restaurants_category(): void
    {
        [, $otherRestaurant] = $this->managerWithRestaurant();
        $category = MenuCategory::factory()->for($otherRestaurant)->create();

        [$manager] = $this->managerWithRestaurant();

        $this->actingAsUser($manager)
            ->getJson("/api/manager/categories/{$category->id}")
            ->assertForbidden();
    }

    public function test_a_manager_can_create_a_menu_item_in_their_own_category(): void
    {
        [$manager, $restaurant] = $this->managerWithRestaurant();
        $category = MenuCategory::factory()->for($restaurant)->create();

        $response = $this->actingAsUser($manager)->postJson('/api/manager/menu-items', [
            'menu_category_id' => $category->id,
            'name' => 'Burger',
            'price' => 9.99,
        ]);

        $response->assertCreated()
            ->assertJsonPath('menu_item.name', 'Burger')
            ->assertJsonPath('menu_item.is_available', true);
    }

    public function test_a_manager_cannot_create_a_menu_item_under_another_restaurants_category(): void
    {
        [, $otherRestaurant] = $this->managerWithRestaurant();
        $otherCategory = MenuCategory::factory()->for($otherRestaurant)->create();

        [$manager] = $this->managerWithRestaurant();

        $response = $this->actingAsUser($manager)->postJson('/api/manager/menu-items', [
            'menu_category_id' => $otherCategory->id,
            'name' => 'Sneaky Item',
            'price' => 5,
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('menu_category_id');
    }

    public function test_a_manager_can_mark_a_menu_item_unavailable(): void
    {
        [$manager, $restaurant] = $this->managerWithRestaurant();
        $category = MenuCategory::factory()->for($restaurant)->create();
        $item = \App\Models\MenuItem::factory()->for($category, 'category')->create(['is_available' => true]);

        $response = $this->actingAsUser($manager)->putJson("/api/manager/menu-items/{$item->id}", [
            'menu_category_id' => $category->id,
            'name' => $item->name,
            'price' => $item->price,
            'is_available' => false,
        ]);

        $response->assertOk()->assertJsonPath('menu_item.is_available', false);
    }
}