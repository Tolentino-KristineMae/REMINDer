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
            ['name' => 'BPI', 'color' => '#3B82F6'],
            ['name' => 'Landbank', 'color' => '#10B981'],
            ['name' => 'Atome', 'color' => '#8B5CF6'],
            ['name' => 'Spay', 'color' => '#F59E0B'],
            ['name' => 'Utility', 'color' => '#06B6D4'],
            ['name' => 'Others', 'color' => '#6B7280'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                ['color' => $category['color']]
            );
        }

        // Seed People in Charge
        $people = [
            ['first_name' => 'Kristine Mae', 'last_name' => 'Tolentino', 'email' => 'kristine@example.com', 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kristine'],
            ['first_name' => 'Nixie Jewel', 'last_name' => 'Para-unda', 'email' => 'nixie@example.com', 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nixie'],
            ['first_name' => 'Babilyn', 'last_name' => 'Tolentino', 'email' => 'babilyn@example.com', 'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Babilyn'],
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
