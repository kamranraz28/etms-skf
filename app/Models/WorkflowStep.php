<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_type_id', 'step_order', 'step_name', 'label', 'role_name'];

    public function workflowType() { return $this->belongsTo(WorkflowType::class); }
    public function approvals() { return $this->hasMany(CsApproval::class, 'workflow_step_id'); }
}
