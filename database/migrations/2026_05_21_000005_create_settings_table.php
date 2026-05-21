<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->text('value')->nullable();
            $t->timestamps();
        });

        DB::table('settings')->insert([
            ['key' => 'login_alert_enabled', 'value' => 'true', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'login_alert_email', 'value' => 'mdkamranhosan98@gmail.com', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void {
        Schema::dropIfExists('settings');
    }
};
