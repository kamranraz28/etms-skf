<?php
namespace Database\Seeders;

use App\Models\Po;
use Illuminate\Database\Seeder;

class PoSeeder extends Seeder
{
    public function run(): void
    {
        Po::updateOrCreate(['po_number' => 'PO-2026-001'], [
            'vendor_erp_code' => 'V001',
            'po_date' => '2026-05-20',
            'items' => [
                ['name' => 'Cisco Catalyst 1300 24-port', 'qty' => 6, 'unit_price' => 25000, 'total_price' => 150000],
            ],
            'status' => 'new',
        ]);
        Po::updateOrCreate(['po_number' => 'PO-2026-002'], [
            'vendor_erp_code' => 'V002',
            'po_date' => '2026-05-19',
            'items' => [
                ['name' => 'Cut-resistant Gloves L', 'qty' => 500, 'unit_price' => 120, 'total_price' => 60000],
                ['name' => 'Safety Goggles', 'qty' => 300, 'unit_price' => 45, 'total_price' => 13500],
            ],
            'status' => 'ordered',
        ]);
        Po::updateOrCreate(['po_number' => 'PO-2026-003'], [
            'vendor_erp_code' => 'V003',
            'po_date' => '2026-05-18',
            'items' => [
                ['name' => 'Café Tables 4-seat', 'qty' => 20, 'unit_price' => 8500, 'total_price' => 170000],
            ],
            'status' => 'received',
        ]);
    }
}
