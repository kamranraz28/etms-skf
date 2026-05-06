<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Cs extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'cs';
    protected $fillable = ['tender_id', 'status', 'submitted_at', 'approved_at', 'created_by'];
    protected $casts = ['submitted_at' => 'datetime', 'approved_at' => 'datetime'];

    public function tender() { return $this->belongsTo(Tender::class); }
    public function items() { return $this->hasMany(CsItem::class); }
    public function selections() { return $this->hasMany(CsItemSelection::class); }
    public function approvals() { return $this->hasMany(CsApproval::class); }
    public function erpLogs() { return $this->hasMany(ErpSync::class); }

}
