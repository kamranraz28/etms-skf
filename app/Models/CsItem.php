<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CsItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'cs_items';
    protected $fillable = ['cs_id', 'bid_id', 'vendor_id', 'total_price', 'rank', 'selected'];
    protected $casts = ['selected' => 'boolean', 'total_price' => 'decimal:2'];

    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function bid() { return $this->belongsTo(Bid::class); }
    public function cs() { return $this->belongsTo(Cs::class); }

}
