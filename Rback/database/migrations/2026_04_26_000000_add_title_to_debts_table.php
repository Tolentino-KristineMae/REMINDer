<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            // Add title column after amount, nullable so existing rows don't break
            $table->string('title')->nullable()->after('amount');
        });

        // Back-fill: copy existing description into title for all existing rows
        DB::statement("UPDATE debts SET title = LEFT(description, 255) WHERE title IS NULL");

        // Now make title required going forward
        Schema::table('debts', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
