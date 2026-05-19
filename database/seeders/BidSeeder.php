<?php
namespace Database\Seeders;

use App\Models\Bid;
use App\Models\Tender;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class BidSeeder extends Seeder
{
    public function run(): void
    {
        $tender = Tender::where('tender_number', 'TND-2026-001')->with('pr')->first();
        if (! $tender) return;
        $vendors = Vendor::where('status', 'active')->get();
        $prItems = $tender->pr->items;
        $unitMatrix = [
            'Acme Industrial Pvt Ltd' => [42000, 8500],
            'Globex Supplies Ltd' => [44500, 8200],
            'Initech Solutions' => [41000, 9100],
        ];
        foreach ($vendors as $v) {
            $units = $unitMatrix[$v->name] ?? [40000, 8000];
            $rows = [];
            $total = 0;
            foreach ($prItems as $i => $it) {
                $up = $units[$i] ?? end($units);
                $rows[] = ['name' => $it['name'], 'qty' => $it['qty'], 'unit' => $it['unit'], 'unit_price' => $up];
                $total += $up * $it['qty'];
            }
            Bid::updateOrCreate(
                ['tender_id' => $tender->id, 'vendor_id' => $v->id],
                ['total_price' => $total, 'currency' => 'BDT', 'item_prices' => $rows, 'submitted_at' => now()]
            );
        }
    }
}
