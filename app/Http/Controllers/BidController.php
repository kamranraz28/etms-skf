<?php
namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\Tender;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BidController extends Controller {
    public function myTenders(Request $r) {
        $vendor = Vendor::where('user_id', $r->user()->id)->first();
        if (! $vendor) return Inertia::render('MyTenders', ['rows' => [], 'vendor' => null]);
        $tenders = Tender::whereIn('id', \App\Models\TenderVendor::where('vendor_id', $vendor->id)->pluck('tender_id'))
            ->get(['id','tender_number','title','deadline','status']);
        $bidTenderIds = Bid::where('vendor_id', $vendor->id)
            ->whereIn('tender_id', $tenders->pluck('id'))->pluck('tender_id')->all();
        $rows = $tenders->map(fn($t) => array_merge($t->toArray(), [
            'hasBid' => in_array($t->id, $bidTenderIds, true),
            'vendorStatus' => $vendor->status,
        ]))->values();
        return Inertia::render('MyTenders', ['rows' => $rows]);
    }

    public function myBids(Request $r) {
        $vendor = Vendor::where('user_id', $r->user()->id)->first();
        if (! $vendor) return Inertia::render('MyBids', ['bids' => []]);
        $bids = Bid::with(['tender:id,tender_number,title,status,deadline', 'csItems.cs:id,status'])
            ->where('vendor_id', $vendor->id)
            ->orderByDesc('submitted_at')->get();
        return Inertia::render('MyBids', ['bids' => $bids]);
    }

    public function create(Request $r, Tender $tender) {
        $vendor = Vendor::with('vendorCategory:id,name')->where('user_id', $r->user()->id)->first();
        $tender->load('pr', 'itemCategories.vendorCategory');
        return Inertia::render('SubmitBid', compact('tender', 'vendor'));
    }

    public function store(Request $r, Tender $tender) {
        $vendor = Vendor::where('user_id', $r->user()->id)->firstOrFail();
        if ($vendor->status !== 'active') return back()->with('error', 'Your profile is not active.');
        if ($tender->deadline->isPast()) return back()->with('error', 'Deadline has passed.');

        $data = $r->validate([
            'item_prices' => 'required|array|min:1',
            'item_prices.*.name' => 'required|string',
            'item_prices.*.qty' => 'required|numeric',
            'item_prices.*.unit' => 'required|string',
            'item_prices.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'document' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        // Validate vendor can only bid on items their category is invited to
        $tender->load('itemCategories');
        $prItems = $tender->pr->items ?? [];
        $itemCatMap = [];
        foreach ($tender->itemCategories as $ic) {
            $itemCatMap[$ic->item_index][] = $ic->vendor_category_id;
        }
        foreach ($data['item_prices'] as $i => $row) {
            $prIdx = null;
            foreach ($prItems as $idx => $prItem) {
                if ($prItem['name'] === $row['name']) { $prIdx = $idx; break; }
            }
            if ($prIdx === null) continue;
            $allowed = $itemCatMap[$prIdx] ?? null;
            // If there's no restriction on this item, any vendor can bid
            if ($allowed !== null && !in_array($vendor->vendor_category_id, $allowed)) {
                return back()->with('error', "You are not invited to bid on item: {$row['name']}");
            }
        }

        $total = 0;
        foreach ($data['item_prices'] as $row) $total += (float) $row['unit_price'] * (float) $row['qty'];
        if ($total <= 0) return back()->with('error', 'Enter prices for the items.');

        $path = null;
        if ($r->hasFile('document')) {
            $path = $r->file('document')->store('bid-docs', 'public');
        }
        Bid::create([
            'tender_id' => $tender->id,
            'vendor_id' => $vendor->id,
            'total_price' => $total,
            'currency' => 'BDT',
            'item_prices' => $data['item_prices'],
            'notes' => $data['notes'] ?? null,
            'document_path' => $path,
            'submitted_at' => now(),
        ]);
        return redirect()->route('app.my-bids')->with('success', 'Bid submitted');
    }

    public function document(Bid $bid) {
        abort_unless($bid->document_path && Storage::disk('public')->exists($bid->document_path), 404);
        return Storage::disk('public')->download($bid->document_path);
    }
}
