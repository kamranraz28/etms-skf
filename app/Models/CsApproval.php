<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class CsApproval extends Model
{
    use HasFactory;

    protected $table = 'cs_approvals';
    protected $fillable = ['cs_id', 'step', 'workflow_step_id', 'decision', 'comment', 'acted_by', 'acted_at'];
    protected $casts = ['acted_at' => 'datetime'];

    public function cs() { return $this->belongsTo(Cs::class); }
    public function workflowStep() { return $this->belongsTo(WorkflowStep::class, 'workflow_step_id'); }
    public function actor() { return $this->belongsTo(User::class, 'acted_by'); }
}
