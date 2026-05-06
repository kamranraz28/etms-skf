<?php
namespace App\Http\Controllers;

use App\Models\Cs;
use App\Models\CsApproval;
use App\Models\CsItemSelection;
use App\Services\ErpSyncService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CsController extends Controller {
    public function index() {
        $rows = Cs::with('tender:id,tender_number,title,deadline')
            ->orderByDesc('created_at')->get();
        return Inertia::render('CS/Index', ['rows' => $rows]);
    }

    public function show(Cs $cs) {
        $cs->load(['tender.pr']);
        $items = $cs->items()->with('vendor:id,name,erp_code,email')->orderBy('rank')->get();
        $selections = $cs->selections()->with('vendor:id,name,erp_code')->get();
        $approvals = $cs->approvals()->orderBy('acted_at')->get();
        $erpLogs = $cs->erpLogs()->orderByDesc('synced_at')->get();
        $prItems = $cs->tender->pr->items ?? [];
        return Inertia::render('CS/Show', compact('cs', 'items', 'selections', 'approvals', 'erpLogs', 'prItems'));
    }

    public function select(Request $r, Cs $cs) {
        if ($cs->status !== 'draft') return back()->with('error', 'CS is locked.');
        $data = $r->validate([
            'item_index' => 'required|integer|min:0',
            'vendor_id' => 'required|exists:vendors,id',
        ]);
        // unselect siblings for this item index
        CsItemSelection::where('cs_id', $cs->id)
            ->where('item_index', $data['item_index'])->update(['selected' => false]);
        // select chosen
        CsItemSelection::where('cs_id', $cs->id)
            ->where('item_index', $data['item_index'])
            ->where('vendor_id', $data['vendor_id'])
            ->update(['selected' => true]);
        // also reflect on cs_items aggregate (mark vendor as selected if any of their items chosen)
        $selectedVendorIds = CsItemSelection::where('cs_id', $cs->id)
            ->where('selected', true)->pluck('vendor_id')->unique();
        \App\Models\CsItem::where('cs_id', $cs->id)->update(['selected' => false]);
        \App\Models\CsItem::where('cs_id', $cs->id)
            ->whereIn('vendor_id', $selectedVendorIds)->update(['selected' => true]);
        return back();
    }

    public function submit(Cs $cs) {
        if (! $cs->selections()->where('selected', true)->exists())
            return back()->with('error', 'Select at least one vendor for an item.');
        $cs->update(['status' => 'pending_approver', 'submitted_at' => now()]);
        return back()->with('success', 'Submitted for approval');
    }

    public function decide(Request $r, Cs $cs) {
        $data = $r->validate([
            'decision' => 'required|in:approved,rejected',
            'comment' => 'nullable|string',
        ]);
        $user = $r->user();
        $step = $cs->status === 'pending_approver' ? 'approver' : 'admin';
        $can = ($step === 'approver' && $user->hasRole('approver'))
            || ($step === 'admin' && $user->hasRole('admin'));
        if (! $can) return back()->with('error', 'Not authorized for this step');

        CsApproval::create([
            'cs_id' => $cs->id, 'step' => $step, 'decision' => $data['decision'],
            'comment' => $data['comment'] ?? null, 'acted_by' => $user->id, 'acted_at' => now(),
        ]);
        if ($data['decision'] === 'rejected') $next = 'rejected';
        elseif ($step === 'approver') $next = 'pending_admin';
        else $next = 'approved';
        $up = ['status' => $next];
        if ($next === 'approved') $up['approved_at'] = now();
        $cs->update($up);
        return back()->with('success', "CS {$data['decision']}");
    }

    public function sendToErp(Cs $cs, ErpSyncService $svc) {
        try {
            $svc->push($cs);
            return back()->with('success', 'Sent to ERP');
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
