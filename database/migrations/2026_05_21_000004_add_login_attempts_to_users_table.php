<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->tinyInteger('login_attempts')->default(0)->after('remember_token');
            $t->timestamp('locked_until')->nullable()->after('login_attempts');
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->dropColumn(['login_attempts', 'locked_until']);
        });
    }
};
