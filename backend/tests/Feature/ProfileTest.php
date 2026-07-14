<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_a_customer_can_view_their_profile(): void
    {
        $user = $this->customer(['name' => 'Jane Doe']);

        $this->actingAsUser($user)
            ->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('user.name', 'Jane Doe');
    }

    public function test_a_customer_can_update_their_profile(): void
    {
        $user = $this->customer();

        $response = $this->actingAsUser($user)->putJson('/api/profile', [
            'name' => 'Updated Name',
            'email' => $user->email,
            'phone' => '+96170000000',
        ]);

        $response->assertOk()->assertJsonPath('user.name', 'Updated Name');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_profile_update_rejects_an_email_already_used_by_another_user(): void
    {
        $this->customer(['email' => 'taken@example.com']);
        $user = $this->customer();

        $response = $this->actingAsUser($user)->putJson('/api/profile', [
            'name' => 'X',
            'email' => 'taken@example.com',
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_profile_update_allows_keeping_the_same_email(): void
    {
        $user = $this->customer();

        $response = $this->actingAsUser($user)->putJson('/api/profile', [
            'name' => 'Still Me',
            'email' => $user->email,
        ]);

        $response->assertOk();
    }
}