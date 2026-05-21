<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('claims', function (Blueprint $t) {
            $t->renameColumn('tender_number', 'po_number');
        });
    }
    public function down(): void {
        Schema::table('claims', function (Blueprint $t) {
            $t->renameColumn('po_number', 'tender_number');
        });
    }
};
