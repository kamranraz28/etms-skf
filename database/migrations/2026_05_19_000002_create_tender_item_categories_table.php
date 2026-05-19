<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tender_item_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tender_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('item_index');
            $table->foreignId('vendor_category_id')->constrained('vendor_categories')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['tender_id', 'item_index', 'vendor_category_id'], 'tender_item_cat_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tender_item_categories');
    }
};
