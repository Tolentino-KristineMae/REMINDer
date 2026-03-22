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
        DB::statement('ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT \'#22c55e\'');
        
        // Make email nullable in person_in_charges
        DB::statement('ALTER TABLE person_in_charges ALTER COLUMN email DROP NOT NULL');
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
