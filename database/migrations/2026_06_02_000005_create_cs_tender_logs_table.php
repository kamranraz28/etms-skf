<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('cs_tender_logs', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('cs_id');
            $t->unsignedBigInteger('new_tender_id');
            $t->unsignedBigInteger('acted_by');
            $t->text('reason')->nullable();
            $t->timestamps();
            $t->foreign('cs_id')->references('id')->on('cs')->cascadeOnDelete();
            $t->foreign('new_tender_id')->references('id')->on('tenders');
            $t->foreign('acted_by')->references('id')->on('users');
        });
    }
    public function down(): void { Schema::dropIfExists('cs_tender_logs'); }
};
