<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('pr_item_assignments', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('pr_id');
            $t->unsignedInteger('item_index');
            $t->string('status', 50)->default('pending');
            $t->unsignedBigInteger('tender_id')->nullable();
            $t->unsignedBigInteger('cs_id')->nullable();
            $t->timestamps();
            $t->unique(['pr_id', 'item_index']);
            $t->foreign('pr_id')->references('id')->on('prs')->cascadeOnDelete();
            $t->foreign('tender_id')->references('id')->on('tenders')->nullOnDelete();
            $t->foreign('cs_id')->references('id')->on('cs')->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('pr_item_assignments');
    }
};
