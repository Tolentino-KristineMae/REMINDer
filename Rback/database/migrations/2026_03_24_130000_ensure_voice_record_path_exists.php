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
        if (!Schema::hasColumn('proof_of_payments', 'voice_record_path')) {
            Schema::table('proof_of_payments', function (Blueprint $table) {
                $table->string('voice_record_path')->nullable()->after('details');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('proof_of_payments', 'voice_record_path')) {
            Schema::table('proof_of_payments', function (Blueprint $table) {
                $table->dropColumn('voice_record_path');
            });
        }
    }
};
