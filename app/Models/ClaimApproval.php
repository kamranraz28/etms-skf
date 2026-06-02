<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClaimApproval extends Model
{
    use HasFactory;

    protected $table = 'claim_approvals';
    protected $fillable = ['claim_id', 'panel', 'workflow_step_id', 'decision', 'comment', 'acted_by', 'acted_at'];
    protected $casts = ['acted_at' => 'datetime'];

    public function claim()
    {
        return $this->belongsTo(Claim::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'acted_by');
    }

    public function workflowStep()
    {
        return $this->belongsTo(WorkflowStep::class, 'workflow_step_id');
    }
}
