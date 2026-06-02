<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('cs_approvals', function (Blueprint $t) {
            $t->unsignedBigInteger('workflow_step_id')->nullable()->after('step');
            $t->foreign('workflow_step_id')->references('id')->on('workflow_steps')->nullOnDelete();
        });
        DB::statement("ALTER TABLE cs_approvals MODIFY COLUMN step VARCHAR(50) NOT NULL DEFAULT 'approver'");
        DB::statement("ALTER TABLE cs_approvals MODIFY COLUMN decision VARCHAR(50) NOT NULL DEFAULT 'approved'");
    }
    public function down(): void {
        Schema::table('cs_approvals', function (Blueprint $t) {
            $t->dropForeign(['workflow_step_id']);
            $t->dropColumn('workflow_step_id');
        });
    }
};
