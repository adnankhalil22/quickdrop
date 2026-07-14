<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Login password for every seeded account is "password".
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'QuickDrop Admin',
            'email' => 'admin@quickdrop.test',
        ]);

        collect(range(1, 3))->each(function (int $i) {
            $manager = User::factory()->manager()->create([
                'name' => "Restaurant Manager {$i}",
                'email' => "manager{$i}@quickdrop.test",
            ]);

            $restaurant = Restaurant::factory()->create([
                'manager_id' => $manager->id,
            ]);

            MenuCategory::factory(3)
                ->for($restaurant)
                ->create()
                ->each(function (MenuCategory $category) {
                    MenuItem::factory(5)->for($category, 'category')->create();
                });
        });

        collect(range(1, 5))->each(function (int $i) {
            $customer = User::factory()->customer()->create([
                'name' => "Customer {$i}",
                'email' => "customer{$i}@quickdrop.test",
            ]);

            Address::factory()->for($customer)->create([
                'label' => 'Home',
                'is_default' => true,
            ]);
        });
    }
}
