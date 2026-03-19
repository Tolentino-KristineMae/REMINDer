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
        Schema::table('proof_of_payments', function (Blueprint $table) {
            $table->text('details')->nullable()->after('file_path');
            $table->string('voice_record_path')->nullable()->after('details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proof_of_payments', function (Blueprint $table) {
            $table->dropColumn(['details', 'voice_record_path']);
        });
    }
};
