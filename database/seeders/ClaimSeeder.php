<?php
namespace Database\Seeders;

use App\Models\Claim;
use App\Models\ClaimApproval;
use App\Models\ClaimDocument;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class ClaimSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = Vendor::whereIn('id', function ($q) {
            $q->select('vendor_id')->from('tender_vendors');
        })->get();

        if ($vendors->isEmpty()) return;

        $procurement = User::whereHas('roles', fn($q) => $q->where('role', 'procurement'))->first();
        $approver = User::whereHas('roles', fn($q) => $q->where('role', 'approver'))->first();
        $admin = User::whereHas('roles', fn($q) => $q->where('role', 'admin'))->first();

        // Claim 1: Fully approved
        $c1 = Claim::create([
            'claim_number' => 'CLM-' . date('Y') . '-001',
            'vendor_id' => $vendors[0]->id,
            'tender_number' => 'TND-2026-001',
            'title' => 'Payment for network switch supply',
            'description' => 'Full payment for 15 network switches delivered as per PO.',
            'amount' => 450000.00,
            'status' => 'approved',
            'submitted_at' => now()->subDays(10),
            'approved_at' => now()->subDays(2),
            'created_by' => $vendors[0]->user_id,
        ]);

        ClaimApproval::create(['claim_id' => $c1->id, 'panel' => 'procurement', 'decision' => 'approved', 'comment' => 'Documents verified', 'acted_by' => $procurement?->id ?? 2, 'acted_at' => now()->subDays(8)]);
        ClaimApproval::create(['claim_id' => $c1->id, 'panel' => 'approver', 'decision' => 'approved', 'comment' => 'Amount is correct', 'acted_by' => $approver?->id ?? 3, 'acted_at' => now()->subDays(5)]);
        ClaimApproval::create(['claim_id' => $c1->id, 'panel' => 'admin', 'decision' => 'approved', 'comment' => 'Final approval granted', 'acted_by' => $admin?->id ?? 1, 'acted_at' => now()->subDays(2)]);

        // Claim 2: Under review with approver
        $c2 = Claim::create([
            'claim_number' => 'CLM-' . date('Y') . '-002',
            'vendor_id' => $vendors[1]->id,
            'tender_number' => 'TND-2026-001',
            'title' => 'Installation service billing',
            'description' => 'Charges for on-site installation of network equipment.',
            'amount' => 125000.00,
            'status' => 'under_review_approver',
            'submitted_at' => now()->subDays(5),
            'created_by' => $vendors[1]->user_id,
        ]);

        ClaimApproval::create(['claim_id' => $c2->id, 'panel' => 'procurement', 'decision' => 'approved', 'comment' => 'Forwarding to approver', 'acted_by' => $procurement?->id ?? 2, 'acted_at' => now()->subDays(3)]);

        // Claim 3: Rejected
        $c3 = Claim::create([
            'claim_number' => 'CLM-' . date('Y') . '-003',
            'vendor_id' => $vendors[0]->id,
            'tender_number' => 'TND-2026-001',
            'title' => 'Additional cabling charges',
            'description' => 'Extra cabling work done beyond original scope.',
            'amount' => 35000.00,
            'status' => 'rejected',
            'submitted_at' => now()->subDays(7),
            'rejected_at' => now()->subDays(4),
            'rejection_reason' => 'Scope not approved. Please raise a separate PO for additional work.',
            'created_by' => $vendors[0]->user_id,
        ]);

        ClaimApproval::create(['claim_id' => $c3->id, 'panel' => 'procurement', 'decision' => 'rejected', 'comment' => 'Scope not approved. Please raise a separate PO for additional work.', 'acted_by' => $procurement?->id ?? 2, 'acted_at' => now()->subDays(4)]);
    }
}
