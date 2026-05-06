<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CsItemSelection extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'cs_item_selections';
    protected $fillable = ['cs_id', 'item_index', 'vendor_id', 'bid_id', 'unit_price', 'qty', 'selected'];
    protected $casts = ['selected' => 'boolean', 'unit_price' => 'decimal:2'];

    public function vendor() { return $this->belongsTo(Vendor::class); }

}
