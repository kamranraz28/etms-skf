<?php
namespace Database\Seeders;

use App\Models\Pr;
use Illuminate\Database\Seeder;

class PrSeeder extends Seeder
{
    public function run(): void
    {
        Pr::updateOrCreate(['pr_number' => 'PR-2026-001'], [
            'title' => 'Network Switches & Cables',
            'department' => 'IT',
            'items' => [
                ['name' => 'Cisco Catalyst 1300 24-port', 'qty' => 6, 'unit' => 'pcs'],
                ['name' => 'Cat6 Cable 305m roll', 'qty' => 4, 'unit' => 'rolls'],
            ],
            'status' => 'new',
        ]);
        Pr::updateOrCreate(['pr_number' => 'PR-2026-002'], [
            'title' => 'PPE Gloves & Goggles',
            'department' => 'Operations',
            'items' => [
                ['name' => 'Cut-resistant Gloves L', 'qty' => 500, 'unit' => 'pairs'],
                ['name' => 'Safety Goggles', 'qty' => 300, 'unit' => 'pcs'],
            ],
            'status' => 'new',
        ]);
    }
}
