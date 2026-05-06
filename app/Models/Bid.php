<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Bid extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'bids';
    protected $fillable = ['tender_id', 'vendor_id', 'total_price', 'currency', 'item_prices', 'notes', 'document_path', 'submitted_at'];
    protected $casts = ['item_prices' => 'array', 'submitted_at' => 'datetime', 'total_price' => 'decimal:2'];

    public function tender() { return $this->belongsTo(Tender::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function csItems() { return $this->hasMany(CsItem::class); }

}
