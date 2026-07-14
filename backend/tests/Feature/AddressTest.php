<?php

namespace Tests\Feature;

use App\Models\Address;
use Tests\TestCase;

class AddressTest extends TestCase
{
    private function validAddress(array $overrides = []): array
    {
        return array_merge([
            'label' => 'Home',
            'city' => 'Beirut',
            'area' => 'Hamra',
            'street' => 'Bliss St',
            'building' => '12',
        ], $overrides);
    }

    public function test_a_customer_can_list_their_own_addresses(): void
    {
        $user = $this->customer();
        Address::factory()->for($user)->create();

        $this->actingAsUser($user)
            ->getJson('/api/addresses')
            ->assertOk()
            ->assertJsonCount(1, 'addresses');
    }

    public function test_the_first_address_created_becomes_the_default(): void
    {
        $user = $this->customer();

        $response = $this->actingAsUser($user)->postJson('/api/addresses', $this->validAddress());

        $response->assertCreated()->assertJsonPath('address.is_default', true);
    }

    public function test_setting_a_new_default_unsets_the_previous_one(): void
    {
        $user = $this->customer();
        $first = Address::factory()->for($user)->create(['is_default' => true]);

        $response = $this->actingAsUser($user)->postJson(
            '/api/addresses',
            $this->validAddress(['label' => 'Work', 'is_default' => true])
        );

        $response->assertCreated();
        $this->assertDatabaseHas('addresses', ['id' => $first->id, 'is_default' => false]);
    }

    public function test_deleting_the_default_address_promotes_another_one(): void
    {
        $user = $this->customer();
        $older = Address::factory()->for($user)->create(['is_default' => false]);
        $default = Address::factory()->for($user)->create(['is_default' => true]);

        $this->actingAsUser($user)
            ->deleteJson("/api/addresses/{$default->id}")
            ->assertOk();

        $this->assertDatabaseHas('addresses', ['id' => $older->id, 'is_default' => true]);
    }

    public function test_a_customer_cannot_view_another_customers_address(): void
    {
        $owner = $this->customer();
        $address = Address::factory()->for($owner)->create();
        $intruder = $this->customer();

        $this->actingAsUser($intruder)
            ->getJson("/api/addresses/{$address->id}")
            ->assertForbidden();
    }

    public function test_a_customer_cannot_delete_another_customers_address(): void
    {
        $owner = $this->customer();
        $address = Address::factory()->for($owner)->create();
        $intruder = $this->customer();

        $this->actingAsUser($intruder)
            ->deleteJson("/api/addresses/{$address->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('addresses', ['id' => $address->id]);
    }

    public function test_creating_an_address_requires_the_required_fields(): void
    {
        $this->actingAsUser($this->customer())
            ->postJson('/api/addresses', ['label' => 'Home'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['city', 'area', 'street', 'building']);
    }
}