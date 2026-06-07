<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('category_vendor', function (Blueprint $t) {
            $t->id();
            $t->foreignId('vendor_category_id')->constrained('vendor_categories')->cascadeOnDelete();
            $t->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $t->unique(['vendor_category_id', 'vendor_id']);
            $t->timestamps();
        });

        // Migrate existing single category assignments to pivot
        DB::statement('INSERT INTO category_vendor (vendor_category_id, vendor_id, created_at, updated_at)
            SELECT vendor_category_id, id, NOW(), NOW() FROM vendors WHERE vendor_category_id IS NOT NULL');

        Schema::table('vendors', function (Blueprint $t) {
            $t->dropForeign(['vendor_category_id']);
            $t->dropColumn('vendor_category_id');
        });
    }
    public function down(): void {
        Schema::table('vendors', function (Blueprint $t) {
            $t->foreignId('vendor_category_id')->nullable()->constrained('vendor_categories')->nullOnDelete();
        });
        DB::statement('UPDATE vendors v JOIN category_vendor cv ON v.id = cv.vendor_id
            SET v.vendor_category_id = cv.vendor_category_id');
        Schema::dropIfExists('category_vendor');
    }
};
