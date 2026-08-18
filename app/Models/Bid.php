<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bid extends Model
{
    use HasFactory;

    protected $table = 'bids';
    protected $fillable = ['tender_id', 'vendor_id', 'total_price', 'currency', 'item_prices', 'notes', 'document_path', 'submitted_at'];
    protected $casts = ['item_prices' => 'array', 'submitted_at' => 'datetime', 'total_price' => 'decimal:2'];

    public function tender() { return $this->belongsTo(Tender::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function csItems() { return $this->hasMany(CsItem::class); }
    public function negotiations() { return $this->hasMany(BidPriceNegotiation::class)->orderBy('created_at'); }
    public function pendingNegotiations() { return $this->hasMany(BidPriceNegotiation::class)->where('status', 'pending'); }

    public function itemPrices(): array
    {
        return $this->item_prices ?? [];
    }

    public function priceForItem(string $itemName): ?array
    {
        foreach ($this->item_prices ?? [] as $row) {
            if (($row['name'] ?? null) === $itemName) return $row;
        }
        return null;
    }

    public function setPriceForItem(string $itemName, float $unitPrice): void
    {
        $prices = $this->item_prices ?? [];
        foreach ($prices as &$row) {
            if (($row['name'] ?? null) === $itemName) {
                $row['unit_price'] = $unitPrice;
            }
        }
        unset($row);
        $this->item_prices = $prices;
        $total = 0;
        foreach ($prices as $row) $total += (float) $row['unit_price'] * (float) $row['qty'];
        $this->total_price = $total;
        $this->save();
    }

}
