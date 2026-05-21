<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claims', function (Blueprint $t) {
            $t->id();
            $t->string('claim_number')->unique();
            $t->unsignedBigInteger('vendor_id');
            $t->string('po_number');
            $t->string('title');
            $t->text('description')->nullable();
            $t->decimal('amount', 14, 2);
            $t->enum('status', ['submitted', 'under_review_procurement', 'under_review_approver', 'under_review_admin', 'approved', 'rejected'])->default('submitted');
            $t->timestamp('submitted_at')->useCurrent();
            $t->timestamp('approved_at')->nullable();
            $t->timestamp('rejected_at')->nullable();
            $t->text('rejection_reason')->nullable();
            $t->unsignedBigInteger('created_by')->nullable();
            $t->timestamps();

            $t->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
            $t->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('claim_documents', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('claim_id');
            $t->enum('document_type', ['invoice', 'delivery_challan', 'payment_receipt', 'other'])->default('other');
            $t->string('original_name');
            $t->string('stored_path');
            $t->string('mime_type')->nullable();
            $t->integer('file_size')->nullable();
            $t->timestamps();

            $t->foreign('claim_id')->references('id')->on('claims')->cascadeOnDelete();
        });

        Schema::create('claim_approvals', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('claim_id');
            $t->enum('panel', ['procurement', 'approver', 'admin']);
            $t->enum('decision', ['approved', 'rejected']);
            $t->text('comment')->nullable();
            $t->unsignedBigInteger('acted_by');
            $t->timestamp('acted_at');
            $t->timestamps();

            $t->foreign('claim_id')->references('id')->on('claims')->cascadeOnDelete();
            $t->foreign('acted_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_approvals');
        Schema::dropIfExists('claim_documents');
        Schema::dropIfExists('claims');
    }
};
