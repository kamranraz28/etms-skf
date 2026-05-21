<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('prs', function (Blueprint $t) {
            $t->id();
            $t->string('pr_number')->unique();
            $t->string('title');
            $t->string('department')->nullable();
            $t->json('items');
            $t->enum('status', ['new','tendered'])->default('new');
            $t->unsignedBigInteger('created_by')->nullable();
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('prs'); }
};
