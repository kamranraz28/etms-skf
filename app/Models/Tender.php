<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Tender extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tenders';
    protected $fillable = ['tender_number', 'pr_id', 'title', 'description', 'deadline', 'status', 'created_by'];
    protected $casts = ['deadline' => 'datetime'];

    public function pr() { return $this->belongsTo(Pr::class); }
    public function vendors() { return $this->belongsToMany(Vendor::class, 'tender_vendors'); }
    public function bids() { return $this->hasMany(Bid::class); }
    public function cs() { return $this->hasOne(Cs::class); }

}
