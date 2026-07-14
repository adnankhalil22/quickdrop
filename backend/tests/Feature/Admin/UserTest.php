<?php

namespace Tests\Feature\Admin;

use Tests\TestCase;

class UserTest extends TestCase
{
    public function test_an_admin_can_create_a_manager_account(): void
    {
        $admin = $this->admin();

        $response = $this->actingAsUser($admin)->postJson('/api/admin/users', [
            'name' => 'New Manager',
            'email' => 'newmanager@example.com',
            'password' => 'password123',
            'role' => 'manager',
        ]);

        $response->assertCreated()->assertJsonPath('user.role', 'manager');
    }

    public function test_creating_a_user_rejects_an_invalid_role(): void
    {
        $admin = $this->admin();

        $this->actingAsUser($admin)->postJson('/api/admin/users', [
            'name' => 'Bad',
            'email' => 'bad@example.com',
            'password' => 'password123',
            'role' => 'superuser',
        ])->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    public function test_the_user_list_can_be_filtered_by_role(): void
    {
        $admin = $this->admin();
        $this->manager();
        $this->manager();
        $this->customer();

        $response = $this->actingAsUser($admin)->getJson('/api/admin/users?role=manager');

        $response->assertOk()->assertJsonCount(2, 'users');
    }

    public function test_an_admin_cannot_delete_their_own_account(): void
    {
        $admin = $this->admin();

        $this->actingAsUser($admin)
            ->deleteJson("/api/admin/users/{$admin->id}")
            ->assertUnprocessable();

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_an_admin_cannot_demote_their_own_role(): void
    {
        $admin = $this->admin();

        $this->actingAsUser($admin)->putJson("/api/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'customer',
        ])->assertUnprocessable();

        $this->assertDatabaseHas('users', ['id' => $admin->id, 'role' => 'admin']);
    }

    public function test_an_admin_can_delete_another_users_account(): void
    {
        $admin = $this->admin();
        $target = $this->customer();

        $this->actingAsUser($admin)
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }
}