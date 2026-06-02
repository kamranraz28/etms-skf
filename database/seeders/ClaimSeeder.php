<?php
namespace Database\Seeders;

use App\Models\Claim;
use App\Models\ClaimApproval;
use App\Models\WorkflowType;
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

        $plantWf = WorkflowType::where('name', 'Plant / Other Bill')->first();
        $steps = $plantWf ? $plantWf->steps()->orderBy('step_order')->get() : collect();
        $userRole = User::whereHas('roles', fn($q) => $q->where('role', 'user'))->first();
        $lineMgr = User::whereHas('roles', fn($q) => $q->where('role', 'line_manager'))->first();
        $scmHead = User::whereHas('roles', fn($q) => $q->where('role', 'scm_head'))->first();
        $finance = User::whereHas('roles', fn($q) => $q->where('role', 'finance_head'))->first();

        $ts = now()->timestamp;

        // Claim 1: Fully approved → forwarded to finance
        $c1 = Claim::create([
            'claim_number' => 'CLM-' . date('Y') . '-S' . $ts . '1',
            'bill_number' => 'INV-2026-001',
            'bill_date' => now()->subDays(12)->format('Y-m-d'),
            'bill_type' => 'plant_other',
            'vendor_id' => $vendors[0]->id,
            'po_number' => $vendors[0]->erp_code ? 'PO-2026-001' : 'TND-2026-001',
            'title' => 'Payment for network switch supply',
            'description' => 'Full payment for 15 network switches delivered as per PO.',
            'amount' => 450000.00,
            'status' => 'forwarded_to_finance',
            'workflow_type_id' => $plantWf?->id,
            'submitted_at' => now()->subDays(10),
            'forwarded_to_finance_at' => now()->subDays(2),
            'created_by' => $vendors[0]->user_id,
        ]);

        if ($steps->isNotEmpty()) {
            $stepMap = $steps->keyBy('step_name');
            $actors = [
                'user' => $userRole,
                'line_manager' => $lineMgr,
                'unit_head' => User::whereHas('roles', fn($q) => $q->where('role', 'unit_head'))->first(),
                'ed' => User::whereHas('roles', fn($q) => $q->where('role', 'executive_director'))->first(),
                'scm_user' => User::whereHas('roles', fn($q) => $q->where('role', 'scm_user'))->first(),
                'scm_head' => $scmHead,
                'finance' => $finance,
            ];
            $approveAt = now()->subDays(10);
            foreach ($steps as $step) {
                $approveAt = $approveAt->addDays(1);
                $actor = $actors[$step->step_name] ?? null;
                ClaimApproval::create([
                    'claim_id' => $c1->id,
                    'panel' => $step->role_name,
                    'workflow_step_id' => $step->id,
                    'decision' => 'approved',
                    'comment' => 'Approved',
                    'acted_by' => $actor?->id ?? 1,
                    'acted_at' => $approveAt,
                ]);
            }
        }

        // Claim 2: Submitted, pending first step (User)
        $c2 = Claim::create([
            'claim_number' => 'CLM-' . date('Y') . '-S' . $ts . '2',
            'bill_number' => 'INV-2026-002',
            'bill_date' => now()->subDays(6)->format('Y-m-d'),
            'bill_type' => 'plant_other',
            'vendor_id' => $vendors[1]->id,
            'po_number' => $vendors[1]->erp_code ? 'PO-2026-002' : 'TND-2026-001',
            'title' => 'Installation service billing',
            'description' => 'Charges for on-site installation of network equipment.',
            'amount' => 125000.00,
            'status' => 'submitted',
            'workflow_type_id' => $plantWf?->id,
            'current_step_id' => $steps->first()?->id,
            'submitted_at' => now()->subDays(5),
            'created_by' => $vendors[1]->user_id,
        ]);

        // Claim 3: Rejected
        $c3 = Claim::create([
            'claim_number' => 'CLM-' . date('Y') . '-S' . $ts . '3',
            'bill_number' => 'INV-2026-003',
            'bill_date' => now()->subDays(8)->format('Y-m-d'),
            'bill_type' => 'plant_other',
            'vendor_id' => $vendors[0]->id,
            'po_number' => $vendors[0]->erp_code ? 'PO-2026-003' : 'TND-2026-001',
            'title' => 'Additional cabling charges',
            'description' => 'Extra cabling work done beyond original scope.',
            'amount' => 35000.00,
            'status' => 'rejected',
            'workflow_type_id' => $plantWf?->id,
            'submitted_at' => now()->subDays(7),
            'rejected_at' => now()->subDays(4),
            'rejection_reason' => 'Scope not approved. Please raise a separate PO for additional work.',
            'created_by' => $vendors[0]->user_id,
        ]);

        if ($steps->isNotEmpty()) {
            $firstStep = $steps->first();
            ClaimApproval::create([
                'claim_id' => $c3->id,
                'panel' => $firstStep->role_name,
                'workflow_step_id' => $firstStep->id,
                'decision' => 'rejected',
                'comment' => 'Scope not approved. Please raise a separate PO for additional work.',
                'acted_by' => $userRole?->id ?? 1,
                'acted_at' => now()->subDays(4),
            ]);
        }
    }
}
