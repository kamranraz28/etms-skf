<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('workflow_steps', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('workflow_type_id');
            $t->integer('step_order');
            $t->string('step_name');
            $t->string('label');
            $t->string('role_name');
            $t->timestamps();
            $t->foreign('workflow_type_id')->references('id')->on('workflow_types')->cascadeOnDelete();
            $t->unique(['workflow_type_id', 'step_order']);
        });
    }
    public function down(): void { Schema::dropIfExists('workflow_steps'); }
};
