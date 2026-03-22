<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add color column to categories
        try {
            DB::statement('ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT \'#22c55e\'');
        } catch (\Exception $e) {
            // Column might already exist
        }

        // Add email and phone columns to person_in_charges if they don't exist
        try {
            DB::statement('ALTER TABLE person_in_charges ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
        } catch (\Exception $e) {
            // Column might already exist
        }

        try {
            DB::statement('ALTER TABLE person_in_charges ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
        } catch (\Exception $e) {
            // Column might already exist
        }
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
