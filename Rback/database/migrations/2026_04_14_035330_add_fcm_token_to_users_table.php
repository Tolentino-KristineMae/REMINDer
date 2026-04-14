<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if column already exists before adding
        if (!Schema::hasColumn('users', 'fcm_token')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('fcm_token', 500)->nullable()->after('remember_token');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'fcm_token')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('fcm_token');
            });
        }
    }
};
