<?php
namespace App\Http\Controllers;

use App\Models\Pr;
use App\Models\Tender;
use App\Models\TenderVendor;
use App\Models\Vendor;
use App\Models\VendorCategory;
use App\Models\Bid;
use App\Services\CsGenerator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenderController extends Controller {
    public function index() {
        $tenders = Tender::with('pr:id,pr_number')
            ->withCount(['bids as bid_count', 'vendors as vendor_count'])
            ->orderByDesc('created_at')->get();
        return Inertia::render('Tenders/Index', ['tenders' => $tenders]);
    }

    public function create(Request $r) {
        return Inertia::render('Tenders/New', [
            'prs' => Pr::orderByDesc('created_at')->get(['id','pr_number','title','status']),
            'vendors' => Vendor::orderBy('name')->get(['id','name','email','erp_code','status','vendor_category_id']),
            'categories' => VendorCategory::orderBy('name')->get(['id','name']),
            'preselect_pr' => $r->query('pr'),
        ]);
    }

    public function store(Request $r) {
        $data = $r->validate([
            'tender_number' => 'required|string|unique:tenders,tender_number',
            'pr_id' => 'required|exists:prs,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'vendor_ids' => 'nullable|array',
            'vendor_ids.*' => 'exists:vendors,id',
            'vendor_category_ids' => 'nullable|array',
            'vendor_category_ids.*' => 'exists:vendor_categories,id',
        ]);

        // Merge vendors from individual selection and categories
        $vendorIds = collect($data['vendor_ids'] ?? [])
            ->merge(
                Vendor::whereIn('vendor_category_id', $data['vendor_category_ids'] ?? [])
                    ->pluck('id')
            )->unique()->values()->all();

        if (empty($vendorIds)) {
            return back()->with('error', 'Please select vendors or categories');
        }

        $tender = Tender::create([
            'tender_number' => $data['tender_number'],
            'pr_id' => $data['pr_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'deadline' => $data['deadline'],
            'status' => 'open',
            'created_by' => $r->user()->id,
        ]);
        foreach ($vendorIds as $vid) {
            TenderVendor::create(['tender_id' => $tender->id, 'vendor_id' => $vid]);
        }
        Pr::where('id', $data['pr_id'])->update(['status' => 'tendered']);
        return redirect()->route('app.tenders.show', $tender)->with('success', 'Tender created');
    }

    public function show(Tender $tender) {
        $tender->load('pr');
        $vendors = $tender->vendors()->get(['vendors.id','name','email','erp_code','status']);
        $bids = Bid::with('vendor:id,name,erp_code')
            ->where('tender_id', $tender->id)
            ->orderBy('total_price')->get();
        $cs = $tender->cs;
        return Inertia::render('Tenders/Show', compact('tender', 'vendors', 'bids', 'cs'));
    }

    public function close(Tender $tender) {
        $tender->update(['status' => 'closed']);
        return back()->with('success', 'Tender closed');
    }

    public function generateCs(Tender $tender, CsGenerator $gen) {
        $cs = $gen->generate($tender);
        return redirect()->route('app.cs.show', $cs)->with('success', 'CS generated');
    }
}
