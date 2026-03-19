<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\PersonInCharge;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Categories
        $categories = [
            ['name' => 'BPI', 'icon' => 'CreditCard'],
            ['name' => 'Landbank', 'icon' => 'Landmark'],
            ['name' => 'Atome', 'icon' => 'ShoppingBag'],
            ['name' => 'Spay', 'icon' => 'Wallet'],
            ['name' => 'Utility', 'icon' => 'Zap'],
            ['name' => 'Others', 'icon' => 'MoreHorizontal'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                ['icon' => $category['icon']]
            );
        }

        // Seed People in Charge
        $people = [
            ['name' => 'Kristine Mae Tolentino', 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kristine'],
            ['name' => 'Nixie Jewel B. Para-unda', 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nixie'],
            ['name' => 'Babilyn T. Tolentino', 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Babilyn'],
        ];

        foreach ($people as $person) {
            PersonInCharge::create($person);
        }

        // Create the admin user
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password123'),
            ]
        );

        // Create the test user
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );
    }
}
