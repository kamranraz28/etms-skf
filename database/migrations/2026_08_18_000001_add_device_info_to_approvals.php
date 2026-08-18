<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cs_approvals', function (Blueprint $t) {
            $t->string('device_ip', 45)->nullable()->after('acted_at');
            $t->string('device_name', 255)->nullable()->after('device_ip');
        });

        Schema::table('claim_approvals', function (Blueprint $t) {
            $t->string('device_ip', 45)->nullable()->after('acted_at');
            $t->string('device_name', 255)->nullable()->after('device_ip');
        });
    }

    public function down(): void
    {
        Schema::table('cs_approvals', function (Blueprint $t) {
            $t->dropColumn(['device_ip', 'device_name']);
        });

        Schema::table('claim_approvals', function (Blueprint $t) {
            $t->dropColumn(['device_ip', 'device_name']);
        });
    }
};
