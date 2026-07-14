<?php

namespace Tests\Feature;

use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    public function test_guests_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/profile')->assertUnauthorized();
        $this->getJson('/api/manager/restaurant')->assertUnauthorized();
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_only_customers_can_access_customer_routes(): void
    {
        $this->actingAsUser($this->customer())->getJson('/api/profile')->assertOk();
        $this->actingAsUser($this->manager())->getJson('/api/profile')->assertForbidden();
        $this->actingAsUser($this->admin())->getJson('/api/profile')->assertForbidden();
    }

    public function test_only_managers_can_access_manager_routes(): void
    {
        $this->actingAsUser($this->customer())->getJson('/api/manager/restaurant')->assertForbidden();
        $this->actingAsUser($this->admin())->getJson('/api/manager/restaurant')->assertForbidden();
    }

    public function test_only_admins_can_access_admin_routes(): void
    {
        $this->actingAsUser($this->customer())->getJson('/api/admin/dashboard')->assertForbidden();
        $this->actingAsUser($this->manager())->getJson('/api/admin/dashboard')->assertForbidden();
        $this->actingAsUser($this->admin())->getJson('/api/admin/dashboard')->assertOk();
    }
}