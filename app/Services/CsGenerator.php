<?php
namespace App\Services;

use App\Models\Bid;
use App\Models\Cs;
use App\Models\CsItem;
use App\Models\CsItemSelection;
use App\Models\Tender;
use Illuminate\Support\Facades\DB;

class CsGenerator
{
    public function generate(Tender $tender): Cs
    {
        return DB::transaction(function () use ($tender) {
            $cs = Cs::create(['tender_id' => $tender->id, 'status' => 'draft']);

            $bids = Bid::where('tender_id', $tender->id)
                ->orderBy('total_price')->get();

            foreach ($bids as $i => $bid) {
                CsItem::create([
                    'cs_id' => $cs->id, 'bid_id' => $bid->id, 'vendor_id' => $bid->vendor_id,
                    'total_price' => $bid->total_price, 'rank' => $i + 1, 'selected' => false,
                ]);
            }

            // Per-item selection matrix
            $prItems = $tender->pr->items ?? [];
            foreach ($prItems as $idx => $prItem) {
                foreach ($bids as $bid) {
                    $row = collect($bid->item_prices ?? [])->firstWhere('name', $prItem['name']);
                    $unit = $row['unit_price'] ?? null;
                    if ($unit === null) continue;
                    CsItemSelection::create([
                        'cs_id' => $cs->id, 'item_index' => $idx, 'vendor_id' => $bid->vendor_id,
                        'bid_id' => $bid->id, 'unit_price' => $unit,
                        'qty' => $prItem['qty'], 'selected' => false,
                    ]);
                }
            }
            return $cs;
        });
    }
}
