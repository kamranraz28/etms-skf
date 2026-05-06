<?php
namespace Database\Seeders;

use App\Models\Pr;
use App\Models\Tender;
use App\Models\TenderVendor;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Database\Seeder;

class TenderSeeder extends Seeder
{
    public function run(): void
    {
        $pr = Pr::where('pr_number', 'PR-2026-001')->first();
        if (! $pr) return;
        $admin = User::where('email', 'admin@etms.test')->first();
        $tender = Tender::updateOrCreate(['tender_number' => 'TND-2026-001'], [
            'pr_id' => $pr->id, 'title' => $pr->title,
            'description' => 'Replace edge switches across HQ.',
            'deadline' => now()->addDays(7), 'status' => 'open',
            'created_by' => $admin?->id,
        ]);
        $pr->update(['status' => 'tendered']);
        foreach (Vendor::where('status', 'active')->pluck('id') as $vid) {
            TenderVendor::firstOrCreate(['tender_id' => $tender->id, 'vendor_id' => $vid]);
        }
    }
}
