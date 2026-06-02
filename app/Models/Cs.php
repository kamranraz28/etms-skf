<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cs extends Model
{
    use HasFactory;

    protected $table = 'cs';
    protected $fillable = ['tender_id', 'workflow_type_id', 'status', 'current_step_id', 'submitted_at', 'approved_at', 'created_by'];
    protected $casts = ['submitted_at' => 'datetime', 'approved_at' => 'datetime'];

    public function tender() { return $this->belongsTo(Tender::class); }
    public function items() { return $this->hasMany(CsItem::class); }
    public function selections() { return $this->hasMany(CsItemSelection::class); }
    public function approvals() { return $this->hasMany(CsApproval::class); }
    public function erpLogs() { return $this->hasMany(ErpSync::class); }
    public function tenderLogs() { return $this->hasMany(CsTenderLog::class); }
    public function workflowType() { return $this->belongsTo(WorkflowType::class); }
    public function currentStep() { return $this->belongsTo(WorkflowStep::class, 'current_step_id'); }

    public function getNextStepAttribute(): ?WorkflowStep
    {
        if (!$this->current_step_id) return null;
        $current = $this->currentStep;
        if (!$current) return null;
        return WorkflowStep::where('workflow_type_id', $current->workflow_type_id)
            ->where('step_order', $current->step_order + 1)->first();
    }

    public function getFirstStepAttribute(): ?WorkflowStep
    {
        if (!$this->workflow_type_id) return null;
        return WorkflowStep::where('workflow_type_id', $this->workflow_type_id)
            ->orderBy('step_order')->first();
    }
}
