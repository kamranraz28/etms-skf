<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claims', function (Blueprint $t) {
            $t->string('bill_number')->nullable()->after('claim_number');
            $t->date('bill_date')->nullable()->after('bill_number');
            $t->string('bill_type')->nullable()->after('bill_date');
            $t->unsignedBigInteger('workflow_type_id')->nullable()->after('bill_type');
            $t->unsignedBigInteger('current_step_id')->nullable()->after('workflow_type_id');
            $t->timestamp('forwarded_to_finance_at')->nullable()->after('rejected_at');

            $t->foreign('workflow_type_id')->references('id')->on('workflow_types')->nullOnDelete();
            $t->foreign('current_step_id')->references('id')->on('workflow_steps')->nullOnDelete();
        });

        DB::statement("ALTER TABLE claims MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'submitted'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE claims MODIFY COLUMN status ENUM('submitted','under_review_procurement','under_review_approver','under_review_admin','approved','rejected') NOT NULL DEFAULT 'submitted'");

        Schema::table('claims', function (Blueprint $t) {
            $t->dropForeign(['workflow_type_id']);
            $t->dropForeign(['current_step_id']);
            $t->dropColumn(['bill_number', 'bill_date', 'bill_type', 'workflow_type_id', 'current_step_id', 'forwarded_to_finance_at']);
        });
    }
};
