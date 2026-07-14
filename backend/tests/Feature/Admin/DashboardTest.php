<?php

namespace Tests\Feature\Admin;

use App\Models\Restaurant;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_the_dashboard_reports_accurate_counts(): void
    {
        $this->customer();
        $this->customer();
        $this->manager();
        Restaurant::factory()->create(['is_active' => true]);
        Restaurant::factory()->create(['is_active' => false]);
        $admin = $this->admin();

        $response = $this->actingAsUser($admin)->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('users.customers', 2)
            ->assertJsonPath('users.managers', 1)
            ->assertJsonPath('users.admins', 1)
            ->assertJsonPath('restaurants.active', 1)
            ->assertJsonPath('restaurants.inactive', 1);
    }
}