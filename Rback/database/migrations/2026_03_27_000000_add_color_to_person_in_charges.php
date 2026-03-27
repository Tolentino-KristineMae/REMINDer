<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        try {
            DB::statement('ALTER TABLE person_in_charges ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT \'#22c55e\'');
        } catch (\Exception $e) {
            // Column might already exist
        }
    }

    public function down(): void
    {
        Schema::table('person_in_charges', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
