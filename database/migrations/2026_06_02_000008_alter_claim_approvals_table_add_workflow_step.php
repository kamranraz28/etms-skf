<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claim_approvals', function (Blueprint $t) {
            $t->unsignedBigInteger('workflow_step_id')->nullable()->after('panel');
            $t->foreign('workflow_step_id')->references('id')->on('workflow_steps')->nullOnDelete();
        });

        DB::statement("ALTER TABLE claim_approvals MODIFY COLUMN panel VARCHAR(50) NOT NULL DEFAULT 'procurement'");
        DB::statement("ALTER TABLE claim_approvals MODIFY COLUMN decision VARCHAR(50) NOT NULL DEFAULT 'approved'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE claim_approvals MODIFY COLUMN panel ENUM('procurement','approver','admin') NOT NULL DEFAULT 'procurement'");
        DB::statement("ALTER TABLE claim_approvals MODIFY COLUMN decision ENUM('approved','rejected') NOT NULL DEFAULT 'approved'");

        Schema::table('claim_approvals', function (Blueprint $t) {
            $t->dropForeign(['workflow_step_id']);
            $t->dropColumn('workflow_step_id');
        });
    }
};
