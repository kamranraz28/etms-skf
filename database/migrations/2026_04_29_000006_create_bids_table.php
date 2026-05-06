<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('bids', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('tender_id');
            $t->uuid('vendor_id');
            $t->decimal('total_price', 14, 2);
            $t->string('currency', 8)->default('INR');
            $t->json('item_prices')->nullable();
            $t->text('notes')->nullable();
            $t->string('document_path')->nullable();
            $t->timestamp('submitted_at')->useCurrent();
            $t->timestamps();
            $t->unique(['tender_id','vendor_id']);
            $t->foreign('tender_id')->references('id')->on('tenders')->cascadeOnDelete();
            $t->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('bids'); }
};
