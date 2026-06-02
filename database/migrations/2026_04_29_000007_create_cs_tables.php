<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('cs', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('tender_id');
            $t->unsignedBigInteger('workflow_type_id')->nullable();
            $t->string('status', 50)->default('draft');
            $t->unsignedBigInteger('current_step_id')->nullable();
            $t->timestamp('submitted_at')->nullable();
            $t->timestamp('approved_at')->nullable();
            $t->unsignedBigInteger('created_by')->nullable();
            $t->timestamps();
            $t->foreign('tender_id')->references('id')->on('tenders')->cascadeOnDelete();
            $t->foreign('workflow_type_id')->references('id')->on('workflow_types')->nullOnDelete();
        });
        Schema::create('cs_items', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('cs_id');
            $t->unsignedBigInteger('bid_id');
            $t->unsignedBigInteger('vendor_id');
            $t->decimal('total_price', 14, 2);
            $t->integer('rank');
            $t->boolean('selected')->default(false);
            $t->timestamps();
            $t->foreign('cs_id')->references('id')->on('cs')->cascadeOnDelete();
            $t->foreign('bid_id')->references('id')->on('bids')->cascadeOnDelete();
            $t->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
        });
        Schema::create('cs_item_selections', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('cs_id');
            $t->integer('item_index');
            $t->unsignedBigInteger('vendor_id');
            $t->unsignedBigInteger('bid_id');
            $t->decimal('unit_price', 14, 2);
            $t->decimal('qty', 14, 2);
            $t->boolean('selected')->default(false);
            $t->timestamps();
            $t->unique(['cs_id','item_index','vendor_id']);
            $t->foreign('cs_id')->references('id')->on('cs')->cascadeOnDelete();
            $t->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
            $t->foreign('bid_id')->references('id')->on('bids')->cascadeOnDelete();
        });
        Schema::create('cs_approvals', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('cs_id');
            $t->string('step', 50);
            $t->unsignedBigInteger('workflow_step_id')->nullable();
            $t->string('decision', 50);
            $t->text('comment')->nullable();
            $t->unsignedBigInteger('acted_by');
            $t->timestamp('acted_at')->useCurrent();
            $t->timestamps();
            $t->foreign('cs_id')->references('id')->on('cs')->cascadeOnDelete();
            $t->foreign('workflow_step_id')->references('id')->on('workflow_steps')->nullOnDelete();
        });
        Schema::create('erp_sync', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('cs_id');
            $t->string('status', 50);
            $t->json('request_payload')->nullable();
            $t->json('response_data')->nullable();
            $t->timestamp('synced_at')->useCurrent();
            $t->timestamps();
            $t->foreign('cs_id')->references('id')->on('cs')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('erp_sync');
        Schema::dropIfExists('cs_approvals');
        Schema::dropIfExists('cs_item_selections');
        Schema::dropIfExists('cs_items');
        Schema::dropIfExists('cs');
    }
};
