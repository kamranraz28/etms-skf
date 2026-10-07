<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cs', function (Blueprint $t) {
            $t->unique('tender_id');
        });
    }

    public function down(): void
    {
        Schema::table('cs', function (Blueprint $t) {
            $t->dropUnique(['tender_id']);
        });
    }
};
