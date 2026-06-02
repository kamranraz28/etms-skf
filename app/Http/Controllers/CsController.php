<?php
namespace App\Http\Controllers;

use App\Events\CsApprovedByApprover;
use App\Models\Cs;
use App\Models\CsApproval;
use App\Models\CsItemSelection;
use App\Models\Tender;
use App\Models\WorkflowType;
use App\Models\WorkflowStep;
use App\Services\ErpSyncService;
use App\Models\CsTenderLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class CsController extends Controller {
    public function index() {
        $rows = Cs::with('tender:id,tender_number,title,deadline', 'workflowType:id,name')
            ->orderByDesc('created_at')->get();
        return Inertia::render('CS/Index', ['rows' => $rows]);
    }

    public function show(Cs $cs) {
        session_write_close();
        $cs->load(['tender.pr', 'workflowType', 'currentStep', 'tenderLogs.newTender', 'tenderLogs.actor']);
        $items = $cs->items()->with('vendor:id,name,erp_code,email')->orderBy('rank')->get();
        $selections = $cs->selections()->with('vendor:id,name,erp_code')->get();
        $approvals = $cs->approvals()->with('workflowStep', 'actor:id,full_name')->orderBy('acted_at')->get();
        $erpLogs = $cs->erpLogs()->orderByDesc('synced_at')->get();
        $prItems = $cs->tender->pr->items ?? [];
        $workflowTypes = WorkflowType::with('steps')->orderBy('name')->get();
        return Inertia::render('CS/Show', compact('cs', 'items', 'selections', 'approvals', 'erpLogs', 'prItems', 'workflowTypes'));
    }

    public function select(Request $r, Cs $cs) {
        if ($cs->status !== 'draft') return back()->with('error', 'CS is locked.');
        $data = $r->validate([
            'item_index' => 'required|integer|min:0',
            'vendor_id' => 'required|exists:vendors,id',
        ]);
        CsItemSelection::where('cs_id', $cs->id)
            ->where('item_index', $data['item_index'])->update(['selected' => false]);
        CsItemSelection::where('cs_id', $cs->id)
            ->where('item_index', $data['item_index'])
            ->where('vendor_id', $data['vendor_id'])
            ->update(['selected' => true]);
        $selectedVendorIds = CsItemSelection::where('cs_id', $cs->id)
            ->where('selected', true)->pluck('vendor_id')->unique();
        \App\Models\CsItem::where('cs_id', $cs->id)->update(['selected' => false]);
        \App\Models\CsItem::where('cs_id', $cs->id)
            ->whereIn('vendor_id', $selectedVendorIds)->update(['selected' => true]);
        return back();
    }

    public function submit(Request $r, Cs $cs) {
        if ($cs->status !== 'draft') return back()->with('error', 'CS is already submitted.');
        if (! $cs->selections()->where('selected', true)->exists())
            return back()->with('error', 'Select at least one vendor for an item.');

        $data = $r->validate([
            'workflow_type_id' => 'required|exists:workflow_types,id',
        ]);

        $firstStep = WorkflowStep::where('workflow_type_id', $data['workflow_type_id'])
            ->orderBy('step_order')->first();
        if (!$firstStep) return back()->with('error', 'Workflow has no steps configured.');

        $cs->update([
            'status' => 'pending_approval',
            'workflow_type_id' => $data['workflow_type_id'],
            'current_step_id' => $firstStep->id,
            'submitted_at' => now(),
        ]);
        return back()->with('success', 'Submitted for approval');
    }

    public function decide(Request $r, Cs $cs) {
        $data = $r->validate([
            'decision' => 'required|in:approved,declined,re_tendered',
            'comment' => 'nullable|string',
        ]);
        $user = $r->user();

        if ($cs->status !== 'pending_approval')
            return back()->with('error', 'CS is not pending approval.');

        $currentStep = $cs->currentStep;
        if (!$currentStep)
            return back()->with('error', 'No active approval step.');

        $can = $user->hasRole($currentStep->role_name);
        if (! $can) return back()->with('error', 'Not authorized for this step.');

        if ($data['decision'] === 'approved') {
            CsApproval::create([
                'cs_id' => $cs->id,
                'step' => $currentStep->step_name,
                'workflow_step_id' => $currentStep->id,
                'decision' => 'approved',
                'comment' => $data['comment'] ?? null,
                'acted_by' => $user->id,
                'acted_at' => now(),
            ]);

            $nextStep = WorkflowStep::where('workflow_type_id', $cs->workflow_type_id)
                ->where('step_order', $currentStep->step_order + 1)->first();

            if ($nextStep) {
                $cs->update(['current_step_id' => $nextStep->id]);
            } else {
                $cs->update(['status' => 'approved', 'current_step_id' => null, 'approved_at' => now()]);
                CsApprovedByApprover::dispatch($cs);
            }
            return back()->with('success', 'CS approved at ' . $currentStep->label);
        }

        if ($data['decision'] === 'declined') {
            CsApproval::create([
                'cs_id' => $cs->id,
                'step' => $currentStep->step_name,
                'workflow_step_id' => $currentStep->id,
                'decision' => 'rejected',
                'comment' => $data['comment'] ?? null,
                'acted_by' => $user->id,
                'acted_at' => now(),
            ]);
            $cs->update(['status' => 'draft', 'current_step_id' => null]);
            return back()->with('success', 'CS returned to draft');
        }

        if ($data['decision'] === 're_tendered') {
            $extra = $r->validate(['deadline' => 'required|date|after:now']);
            CsApproval::create([
                'cs_id' => $cs->id,
                'step' => $currentStep->step_name,
                'workflow_step_id' => $currentStep->id,
                'decision' => 're_tendered',
                'comment' => $data['comment'] ?? null,
                'acted_by' => $user->id,
                'acted_at' => now(),
            ]);

            // Create a new tender from the same PR
            $oldTender = $cs->tender;
            $pr = $oldTender->pr;
            $newTender = Tender::create([
                'tender_number' => $oldTender->tender_number . '-RT-' . $cs->id,
                'pr_id' => $pr->id,
                'title' => $oldTender->title . ' (Re-tender)',
                'description' => $oldTender->description,
                'deadline' => $extra['deadline'],
                'status' => 'open',
                'created_by' => $user->id,
            ]);

            // Copy vendors from old tender
            $oldVendorIds = $oldTender->vendors()->pluck('vendors.id');
            foreach ($oldVendorIds as $vid) {
                \App\Models\TenderVendor::create(['tender_id' => $newTender->id, 'vendor_id' => $vid]);
            }

            // Copy item categories
            foreach ($oldTender->itemCategories as $ic) {
                \App\Models\TenderItemCategory::create([
                    'tender_id' => $newTender->id,
                    'item_index' => $ic->item_index,
                    'vendor_category_id' => $ic->vendor_category_id,
                ]);
            }

            CsTenderLog::create([
                'cs_id' => $cs->id,
                'new_tender_id' => $newTender->id,
                'acted_by' => $user->id,
                'reason' => $data['comment'] ?? 'Re-tender requested',
            ]);

            $cs->update(['status' => 're_tendered', 'current_step_id' => null]);

            return redirect()->route('app.tenders.show', $newTender)
                ->with('success', 'New tender created for re-tender');
        }

        return back()->with('error', 'Invalid decision.');
    }

    public function downloadPdf(Cs $cs) {
        if ($cs->status !== 'approved') {
            return back()->with('error', 'Only approved CS can be downloaded.');
        }

        $cs->load(['tender.pr', 'approvals.workflowStep', 'workflowType']);
        $items = $cs->items()->with('vendor:id,name,erp_code,email')->orderBy('rank')->get();
        $selections = $cs->selections()->with('vendor:id,name,erp_code')->where('selected', true)->get();
        $prItems = $cs->tender->pr->items ?? [];

        $pdf = Pdf::loadView('pdf.cs', compact('cs', 'items', 'selections', 'prItems'));
        $filename = 'CS-' . $cs->id . '_' . ($cs->tender->tender_number ?? 'tender') . '.pdf';

        return $pdf->download($filename);
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
