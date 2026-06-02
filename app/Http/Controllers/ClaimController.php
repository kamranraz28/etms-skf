<?php
namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\ClaimApproval;
use App\Models\Vendor;
use App\Models\Po;
use App\Models\WorkflowType;
use App\Models\WorkflowStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClaimController extends Controller
{
    // ── Vendor ──────────────────────────────────────────────────────

    public function myClaims(Request $r)
    {
        $vendor = Vendor::where('user_id', $r->user()->id)->first();
        if (! $vendor) {
            return Inertia::render('MyClaims', ['claims' => []]);
        }
        $claims = Claim::with('documents', 'workflowType', 'currentStep')
            ->where('vendor_id', $vendor->id)
            ->orderByDesc('created_at')
            ->get();
        return Inertia::render('MyClaims', ['claims' => $claims]);
    }

    public function myClaimShow(Request $r, Claim $claim)
    {
        $vendor = Vendor::where('user_id', $r->user()->id)->firstOrFail();
        if ($claim->vendor_id !== $vendor->id) {
            abort(403, 'You can only view your own claims.');
        }
        $claim->load([
            'vendor', 'documents',
            'approvals.workflowStep', 'approvals.actor:id,full_name,email',
            'creator:id,full_name', 'workflowType', 'currentStep',
            'workflowType.steps',
        ]);
        return Inertia::render('Claims/Show', ['claim' => $claim]);
    }

    public function createClaim(Request $r)
    {
        $vendor = Vendor::where('user_id', $r->user()->id)->firstOrFail();
        $pos = Po::where('vendor_erp_code', $vendor->erp_code)
            ->orderByDesc('created_at')
            ->get(['id', 'po_number', 'po_date', 'items']);
        $billTypes = [
            ['value' => 'plant_other', 'label' => 'Plant / Other Bill'],
            ['value' => 'ohq_packing', 'label' => 'OHQ Packing Material Bill'],
        ];
        return Inertia::render('NewClaim', [
            'vendor' => $vendor,
            'pos' => $pos,
            'billTypes' => $billTypes,
        ]);
    }

    public function storeClaim(Request $r)
    {
        $vendor = Vendor::where('user_id', $r->user()->id)->firstOrFail();
        if ($vendor->status !== 'active') {
            return back()->with('error', 'Your vendor profile is not active.');
        }

        $vendorPoNumbers = Po::where('vendor_erp_code', $vendor->erp_code)
            ->pluck('po_number')
            ->toArray();
        if (empty($vendorPoNumbers)) {
            return back()->with('error', 'No purchase orders found for your vendor profile.');
        }

        $data = $r->validate([
            'bill_number' => 'required|string|max:255',
            'bill_date' => 'required|date',
            'bill_type' => 'required|in:plant_other,ohq_packing',
            'po_number' => 'required|string|in:' . implode(',', $vendorPoNumbers),
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'documents' => 'required|array|min:1',
            'documents.*.type' => 'required|in:invoice,delivery_challan,payment_receipt,other',
            'documents.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        // Bill number must be unique per vendor
        $existing = Claim::where('vendor_id', $vendor->id)
            ->where('bill_number', $data['bill_number'])
            ->exists();
        if ($existing) {
            return back()->with('error', 'Bill number "' . $data['bill_number'] . '" already used by your vendor profile.')
                ->withInput();
        }

        // Total claimed amount cannot exceed PO total received amount
        $po = Po::where('vendor_erp_code', $vendor->erp_code)
            ->where('po_number', $data['po_number'])
            ->first();
        $poTotal = collect($po->items ?? [])->sum('total_price');
        $alreadyClaimed = Claim::where('vendor_id', $vendor->id)
            ->where('po_number', $data['po_number'])
            ->whereIn('status', ['submitted', 'forwarded_to_finance'])
            ->sum('amount');
        if (($alreadyClaimed + $data['amount']) > $poTotal) {
            return back()->with('error', 'Total claimed amount (existing: ' . number_format($alreadyClaimed, 2) . ' + current: ' . number_format($data['amount'], 2) . ') exceeds PO total of ' . number_format($poTotal, 2) . '.')
                ->withInput();
        }

        // Map bill_type to workflow
        $wfName = $data['bill_type'] === 'plant_other' ? 'Plant / Other Bill' : 'OHQ Packing Material Bill';
        $workflowType = WorkflowType::where('name', $wfName)->first();
        if (!$workflowType || !$workflowType->steps()->exists()) {
            return back()->with('error', 'No workflow configured for this bill type. Contact admin.');
        }

        $firstStep = $workflowType->steps()->orderBy('step_order')->first();

        $claimNumber = 'CLM-' . date('Y') . '-' . str_pad(
            Claim::whereYear('created_at', now()->year)->count() + 1, 3, '0', STR_PAD_LEFT
        );

        $claim = Claim::create([
            'claim_number' => $claimNumber,
            'bill_number' => $data['bill_number'],
            'bill_date' => $data['bill_date'],
            'bill_type' => $data['bill_type'],
            'vendor_id' => $vendor->id,
            'po_number' => $data['po_number'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'amount' => $data['amount'],
            'status' => 'submitted',
            'workflow_type_id' => $workflowType->id,
            'current_step_id' => $firstStep->id,
            'submitted_at' => now(),
            'created_by' => $r->user()->id,
        ]);

        foreach ($data['documents'] as $doc) {
            $path = $doc['file']->store('claim-docs/' . $claim->id, 'public');
            $claim->documents()->create([
                'document_type' => $doc['type'],
                'original_name' => $doc['file']->getClientOriginalName(),
                'stored_path' => $path,
                'mime_type' => $doc['file']->getMimeType(),
                'file_size' => $doc['file']->getSize(),
            ]);
        }

        return redirect()->route('app.my-claims')->with('success', 'Claim submitted successfully.');
    }

    // ── Staff (index, show) ────────────────────────────────────────

    public function index(Request $r)
    {
        $user = $r->user();
        $query = Claim::with('vendor:id,name,email,erp_code', 'workflowType:id,name', 'currentStep:id,label,role_name');

        // Filter claims where user's role matches the current step's role_name
        $userRoles = $user->roles()->pluck('role')->all();
        if (!$user->hasRole('admin')) {
            $query->whereIn('status', ['submitted'])
                ->whereHas('currentStep', function ($q) use ($userRoles) {
                    $q->whereIn('role_name', $userRoles);
                });
        }

        if ($r->filled('status')) {
            if ($user->hasRole('admin')) {
                $query->where('status', $r->status);
            }
        }

        $rows = $query->orderByDesc('created_at')->get();

        if ($user->hasRole('admin')) {
            $vendors = Vendor::where('status', 'active')->get(['id', 'name', 'erp_code']);
            return Inertia::render('Claims/Index', [
                'rows' => $rows,
                'vendors' => $vendors,
                'filters' => ['status' => $r->status ?? ''],
            ]);
        }

        return Inertia::render('Claims/Index', ['rows' => $rows]);
    }

    public function show(Claim $claim)
    {
        $claim->load([
            'vendor', 'documents',
            'approvals.workflowStep', 'approvals.actor:id,full_name,email',
            'creator:id,full_name', 'workflowType', 'currentStep',
            'workflowType.steps',
        ]);
        return Inertia::render('Claims/Show', ['claim' => $claim]);
    }

    // ── Staff decision ─────────────────────────────────────────────

    public function decide(Request $r, Claim $claim)
    {
        $data = $r->validate([
            'decision' => 'required|in:approved,rejected',
            'comment' => 'nullable|string',
        ]);

        $user = $r->user();

        if ($claim->status !== 'submitted') {
            return back()->with('error', 'Claim is not pending approval.');
        }

        $currentStep = $claim->currentStep;
        if (!$currentStep) {
            return back()->with('error', 'No active approval step.');
        }

        if (!$user->hasRole($currentStep->role_name)) {
            return back()->with('error', 'Not authorized for this step.');
        }

        if ($data['decision'] === 'approved') {
            ClaimApproval::create([
                'claim_id' => $claim->id,
                'panel' => $currentStep->role_name,
                'workflow_step_id' => $currentStep->id,
                'decision' => 'approved',
                'comment' => $data['comment'] ?? null,
                'acted_by' => $user->id,
                'acted_at' => now(),
            ]);

            $nextStep = WorkflowStep::where('workflow_type_id', $claim->workflow_type_id)
                ->where('step_order', $currentStep->step_order + 1)->first();

            if ($nextStep) {
                $claim->update(['current_step_id' => $nextStep->id]);
                return back()->with('success', 'Claim approved at ' . $currentStep->label . '. Forwarded to next step.');
            }

            // Final approval
            $claim->update([
                'status' => 'forwarded_to_finance',
                'current_step_id' => null,
                'forwarded_to_finance_at' => now(),
            ]);
            return back()->with('success', 'Claim fully approved. Forwarded to Finance for Payment.');
        }

        // Rejected
        ClaimApproval::create([
            'claim_id' => $claim->id,
            'panel' => $currentStep->role_name,
            'workflow_step_id' => $currentStep->id,
            'decision' => 'rejected',
            'comment' => $data['comment'] ?? null,
            'acted_by' => $user->id,
            'acted_at' => now(),
        ]);

        $claim->update([
            'status' => 'rejected',
            'current_step_id' => null,
            'rejected_at' => now(),
            'rejection_reason' => $data['comment'] ?? null,
        ]);

        return back()->with('success', 'Claim rejected.');
    }

    // ── Document download ──────────────────────────────────────────

    public function document($claimId, $docId)
    {
        $doc = \App\Models\ClaimDocument::where('claim_id', $claimId)->findOrFail($docId);
        abort_unless(Storage::disk('public')->exists($doc->stored_path), 404);
        return Storage::disk('public')->download($doc->stored_path, $doc->original_name);
    }

    // ── Admin report ───────────────────────────────────────────────

    public function history(Request $r)
    {
        $query = Claim::with([
            'vendor:id,name,email,erp_code',
            'approvals.actor:id,full_name',
            'workflowType:id,name',
        ]);

        if ($r->filled('vendor_id')) {
            $query->where('vendor_id', $r->vendor_id);
        }
        if ($r->filled('status')) {
            $query->where('status', $r->status);
        }

        $claims = $query->orderByDesc('created_at')->get();
        $vendors = Vendor::orderBy('name')->get(['id', 'name', 'erp_code']);

        return Inertia::render('Claims/History', [
            'claims' => $claims,
            'vendors' => $vendors,
            'filters' => ['vendor_id' => $r->vendor_id ?? '', 'status' => $r->status ?? ''],
        ]);
    }
}
