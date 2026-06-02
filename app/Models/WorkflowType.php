<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkflowType extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function steps() { return $this->hasMany(WorkflowStep::class)->orderBy('step_order'); }
    public function csList() { return $this->hasMany(Cs::class, 'workflow_type_id'); }
}
