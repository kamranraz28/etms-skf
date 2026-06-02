<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Claim extends Model
{
    use HasFactory;

    protected $table = 'claims';
    protected $fillable = [
        'claim_number', 'bill_number', 'bill_date', 'bill_type',
        'vendor_id', 'po_number', 'title', 'description',
        'amount', 'status', 'workflow_type_id', 'current_step_id',
        'submitted_at', 'approved_at', 'rejected_at', 'forwarded_to_finance_at',
        'rejection_reason', 'created_by',
    ];
    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'forwarded_to_finance_at' => 'datetime',
        'bill_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function documents()
    {
        return $this->hasMany(ClaimDocument::class);
    }

    public function approvals()
    {
        return $this->hasMany(ClaimApproval::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function workflowType()
    {
        return $this->belongsTo(WorkflowType::class);
    }

    public function currentStep()
    {
        return $this->belongsTo(WorkflowStep::class, 'current_step_id');
    }

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
