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
        // Use raw SQL to check and add column if not exists
        // This is more resilient to transaction errors
        $connection = Schema::getConnection();
        $schema = $connection->getSchemaBuilder();
        
        try {
            if (!$schema->hasColumn('users', 'fcm_token')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('fcm_token', 500)->nullable();
                });
            }
        } catch (\Exception $e) {
            // If there's an error, try with raw SQL
            try {
                $connection->statement('ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(500) NULL');
            } catch (\Exception $e2) {
                // Column might already exist, ignore
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('fcm_token');
            });
        } catch (\Exception $e) {
            // Column might not exist, ignore
        }
    }
};
