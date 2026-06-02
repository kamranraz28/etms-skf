<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CsTenderLog extends Model
{
    use HasFactory;

    protected $table = 'cs_tender_logs';
    protected $fillable = ['cs_id', 'new_tender_id', 'acted_by', 'reason'];

    public function cs() { return $this->belongsTo(Cs::class); }
    public function newTender() { return $this->belongsTo(Tender::class, 'new_tender_id'); }
    public function actor() { return $this->belongsTo(User::class, 'acted_by'); }
}
