<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('cs', function (Blueprint $t) {
            $t->unsignedBigInteger('workflow_type_id')->nullable()->after('tender_id');
            $t->unsignedBigInteger('current_step_id')->nullable()->after('status');
            $t->foreign('workflow_type_id')->references('id')->on('workflow_types')->nullOnDelete();
        });
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE cs MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'draft'");
    }
    public function down(): void {
        Schema::table('cs', function (Blueprint $t) {
            $t->dropForeign(['workflow_type_id']);
            $t->dropColumn('workflow_type_id');
            $t->dropColumn('current_step_id');
        });
    }
};
