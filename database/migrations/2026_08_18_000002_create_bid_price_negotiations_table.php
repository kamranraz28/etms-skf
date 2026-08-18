<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bid_price_negotiations', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('bid_id');
            $t->unsignedBigInteger('tender_id');
            $t->unsignedBigInteger('vendor_id');
            $t->string('item_name');
            $t->decimal('old_price', 14, 2);
            $t->decimal('offered_price', 14, 2);
            $t->string('status', 20)->default('pending');
            $t->decimal('counter_price', 14, 2)->nullable();
            $t->text('vendor_comment')->nullable();
            $t->unsignedBigInteger('offered_by')->nullable();
            $t->timestamp('responded_at')->nullable();
            $t->timestamps();

            $t->foreign('bid_id')->references('id')->on('bids')->cascadeOnDelete();
            $t->foreign('tender_id')->references('id')->on('tenders')->cascadeOnDelete();
            $t->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
            $t->foreign('offered_by')->references('id')->on('users')->nullOnDelete();
            $t->index(['tender_id', 'vendor_id']);
            $t->index(['bid_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bid_price_negotiations');
    }
};
