<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PrItemAssignment extends Model
{
    protected $table = 'pr_item_assignments';
    protected $fillable = ['pr_id', 'item_index', 'status', 'tender_id', 'cs_id'];
    public function pr() { return $this->belongsTo(Pr::class); }
    public function tender() { return $this->belongsTo(Tender::class); }
    public function cs() { return $this->belongsTo(Cs::class); }
}
