<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('tenders', function (Blueprint $t) {
            $t->id();
            $t->string('tender_number')->unique();
            $t->unsignedBigInteger('pr_id');
            $t->string('title');
            $t->text('description')->nullable();
            $t->dateTime('deadline');
            $t->enum('status', ['open','closed','awarded'])->default('open');
            $t->unsignedBigInteger('created_by')->nullable();
            $t->timestamps();
            $t->foreign('pr_id')->references('id')->on('prs')->cascadeOnDelete();
        });
        Schema::create('tender_vendors', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('tender_id');
            $t->unsignedBigInteger('vendor_id');
            $t->timestamps();
            $t->unique(['tender_id','vendor_id']);
            $t->foreign('tender_id')->references('id')->on('tenders')->cascadeOnDelete();
            $t->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('tender_vendors');
        Schema::dropIfExists('tenders');
    }
};
