<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pos', function (Blueprint $t) {
            $t->id();
            $t->string('po_number')->unique();
            $t->string('vendor_erp_code')->nullable()->index();
            $t->json('items');
            $t->date('po_date')->nullable();
            $t->enum('status', ['new', 'ordered', 'received', 'cancelled'])->default('new');
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('pos'); }
};
