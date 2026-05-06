<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('vendors', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('user_id')->nullable();
            $t->string('name');
            $t->string('email');
            $t->string('phone')->nullable();
            $t->string('erp_code')->nullable()->unique();
            $t->enum('status', ['pending','active','inactive','blacklisted'])->default('pending');
            $t->text('notes')->nullable();
            $t->timestamps();
            $t->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('vendors'); }
};
