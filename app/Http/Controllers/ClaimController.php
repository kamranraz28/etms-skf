<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\ClaimApproval;
use App\Models\Vendor;
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
        $claims = Claim::with('documents')
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
        $claim->load(['vendor', 'documents', 'approvals.actor:id,full_name,email', 'creator:id,full_name']);
        return Inertia::render('Claims/Show', ['claim' => $claim]);
    }

    public function createClaim(Request $r)
    {
        $vendor = Vendor::where('user_id', $r->user()->id)->firstOrFail();
        $pos = \App\Models\Po::where('vendor_erp_code', $vendor->erp_code)
            ->orderByDesc('created_at')
            ->get(['id', 'po_number', 'po_date', 'items']);
        return Inertia::render('NewClaim', ['vendor' => $vendor, 'pos' => $pos]);
    }

    public function storeClaim(Request $r)
    {
        $vendor = Vendor::where('user_id', $r->user()->id)->firstOrFail();
        if ($vendor->status !== 'active') {
            return back()->with('error', 'Your vendor profile is not active.');
        }

        $vendorPoNumbers = \App\Models\Po::where('vendor_erp_code', $vendor->erp_code)
            ->pluck('po_number')
            ->toArray();
        if (empty($vendorPoNumbers)) {
            return back()->with('error', 'No purchase orders found for your vendor profile.');
        }

        $data = $r->validate([
            'po_number' => 'required|string|in:' . implode(',', $vendorPoNumbers),
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'documents' => 'required|array|min:1',
            'documents.*.type' => 'required|in:invoice,delivery_challan,payment_receipt,other',
            'documents.*.file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        $claimNumber = 'CLM-' . date('Y') . '-' . str_pad(
            Claim::whereYear('created_at', now()->year)->count() + 1, 3, '0', STR_PAD_LEFT
        );

        $claim = Claim::create([
            'claim_number' => $claimNumber,
            'vendor_id' => $vendor->id,
            'po_number' => $data['po_number'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'amount' => $data['amount'],
            'status' => 'submitted',
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

        return redirect()->route('app.my-claims')->with('success', 'Claim submitted.');
    }

    // ── Staff (index, show) ────────────────────────────────────────

    public function index(Request $r)
    {
        $user = $r->user();
        $query = Claim::with('vendor:id,name,email,erp_code');

        // Procurement sees submitted/under_review_procurement claims
        // Approver sees under_review_approver claims
        // Admin sees all but can filter
        if ($user->hasRole('procurement')) {
            $query->whereIn('status', ['submitted', 'under_review_procurement']);
        } elseif ($user->hasRole('approver')) {
            $query->where('status', 'under_review_approver');
        } elseif ($user->hasRole('admin') && $r->filled('vendor_id')) {
            $query->where('vendor_id', $r->vendor_id);
        }

        // Optional status filter for staff
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
                'filters' => ['vendor_id' => $r->vendor_id ?? '', 'status' => $r->status ?? ''],
            ]);
        }

        return Inertia::render('Claims/Index', ['rows' => $rows]);
    }

    public function show(Claim $claim)
    {
        $claim->load(['vendor', 'documents', 'approvals.actor:id,full_name,email', 'creator:id,full_name']);
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
        $currentStatus = $claim->status;
        $panel = null;

        if ($currentStatus === 'submitted' && $user->hasRole('procurement')) {
            $panel = 'procurement';
            $nextStatus = $data['decision'] === 'approved' ? 'under_review_approver' : 'rejected';
        } elseif ($currentStatus === 'under_review_approver' && $user->hasRole('approver')) {
            $panel = 'approver';
            $nextStatus = $data['decision'] === 'approved' ? 'under_review_admin' : 'rejected';
        } elseif (in_array($currentStatus, ['under_review_admin', 'under_review_procurement']) && $user->hasRole('admin')) {
            $panel = 'admin';
            $nextStatus = $data['decision'] === 'approved' ? 'approved' : 'rejected';
        } else {
            return back()->with('error', 'Not authorized for this step.');
        }

        ClaimApproval::create([
            'claim_id' => $claim->id,
            'panel' => $panel,
            'decision' => $data['decision'],
            'comment' => $data['comment'] ?? null,
            'acted_by' => $user->id,
            'acted_at' => now(),
        ]);

        $update = ['status' => $nextStatus];
        if ($nextStatus === 'approved') $update['approved_at'] = now();
        if ($nextStatus === 'rejected') {
            $update['rejected_at'] = now();
            $update['rejection_reason'] = $data['comment'] ?? null;
        }
        $claim->update($update);

        $msg = $data['decision'] === 'approved'
            ? 'Claim forwarded to next panel.'
            : 'Claim rejected.';

        return back()->with('success', $msg);
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
        $query = Claim::with(['vendor:id,name,email,erp_code', 'approvals.actor:id,full_name']);

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
