<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BidPriceNegotiation extends Model
{
    use HasFactory;

    protected $table = 'bid_price_negotiations';

    protected $fillable = [
        'bid_id', 'tender_id', 'vendor_id', 'item_name',
        'old_price', 'offered_price', 'status',
        'counter_price', 'vendor_comment', 'offered_by', 'responded_at',
    ];

    protected $casts = [
        'old_price' => 'decimal:2',
        'offered_price' => 'decimal:2',
        'counter_price' => 'decimal:2',
        'responded_at' => 'datetime',
    ];

    public function bid() { return $this->belongsTo(Bid::class); }
    public function tender() { return $this->belongsTo(Tender::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function offeredBy() { return $this->belongsTo(User::class, 'offered_by'); }

    public function effectivePrice(): float
    {
        return match ($this->status) {
            'accepted' => (float) $this->offered_price,
            'counter' => (float) $this->counter_price,
            default => (float) $this->old_price,
        };
    }
}
