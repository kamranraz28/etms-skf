<?php
namespace App\Http\Controllers;

use App\Models\Pr;
use App\Models\PrItemAssignment;
use App\Models\Cs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrController extends Controller {
    private const MOCK_PRS = [
        ['title' => 'Network Switches & Cables', 'department' => 'IT',
         'items' => [['name' => 'Cisco Catalyst 1300 24-port', 'qty' => 6, 'unit' => 'pcs'], ['name' => 'Cat6 Cable 305m roll', 'qty' => 4, 'unit' => 'rolls']]],
        ['title' => 'PPE Gloves & Goggles', 'department' => 'Operations',
         'items' => [['name' => 'Cut-resistant Gloves L', 'qty' => 500, 'unit' => 'pairs'], ['name' => 'Safety Goggles', 'qty' => 300, 'unit' => 'pcs']]],
        ['title' => 'Cafeteria Refurbishment', 'department' => 'Admin',
         'items' => [['name' => 'Café Tables 4-seat', 'qty' => 20, 'unit' => 'pcs'], ['name' => 'Bistro Chairs', 'qty' => 80, 'unit' => 'pcs']]],
        ['title' => 'Diesel Generator Set 250kVA', 'department' => 'Facilities',
         'items' => [['name' => 'DG Set 250kVA Silent', 'qty' => 1, 'unit' => 'pcs'], ['name' => 'AMF Panel', 'qty' => 1, 'unit' => 'pcs']]],
        ['title' => 'Stationery Quarterly', 'department' => 'Admin',
         'items' => [['name' => 'A4 Paper 80gsm Reams', 'qty' => 200, 'unit' => 'reams'], ['name' => 'Ballpoint Pens Box-50', 'qty' => 40, 'unit' => 'boxes']]],
    ];

    public function index() {
        return Inertia::render('PRs', [
            'prs' => Pr::with('assignments')->orderByDesc('created_at')->get(),
        ]);
    }

    public function show(Pr $pr) {
        $pr->load('assignments.tender', 'assignments.cs.tender');
        $approvedCsList = Cs::with('tender:id,tender_number,title')
            ->where('status', 'approved')
            ->orderByDesc('created_at')
            ->get(['id', 'tender_id', 'status', 'created_at']);
        return Inertia::render('PRs/Show', [
            'pr' => $pr,
            'approvedCsList' => $approvedCsList,
        ]);
    }

    public function sync() {
        $pick = self::MOCK_PRS[array_rand(self::MOCK_PRS)];
        $number = 'PR-' . date('Y') . '-' . random_int(100, 999);
        Pr::create([
            'pr_number' => $number,
            'title' => $pick['title'],
            'department' => $pick['department'],
            'items' => $pick['items'],
            'status' => 'new',
        ]);
        return back()->with('success', "Synced $number from ERP");
    }

    public function store(Request $r) {
        $data = $r->validate([
            'pr_number' => 'required|string|unique:prs,pr_number',
            'title' => 'required|string',
            'department' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.unit' => 'required|string',
        ]);
        $data['status'] = 'new';
        Pr::create($data);
        return back()->with('success', 'PR created');
    }

    public function assignCs(Request $r, Pr $pr) {
        $data = $r->validate([
            'item_index' => 'required|integer|min:0',
            'cs_id' => 'required|exists:cs,id',
        ]);

        $items = $pr->items ?? [];
        if ($data['item_index'] >= count($items)) {
            return back()->with('error', 'Invalid item index.');
        }

        $cs = Cs::findOrFail($data['cs_id']);
        if ($cs->status !== 'approved') {
            return back()->with('error', 'Only approved CS records can be assigned.');
        }

        $existing = PrItemAssignment::where('pr_id', $pr->id)
            ->where('item_index', $data['item_index'])->first();
        if ($existing && $existing->status !== 'pending') {
            return back()->with('error', 'This item already has an assignment.');
        }

        PrItemAssignment::updateOrCreate(
            ['pr_id' => $pr->id, 'item_index' => $data['item_index']],
            ['status' => 'cs_assigned', 'tender_id' => null, 'cs_id' => $cs->id]
        );

        $totalItems = count($items);
        $assignedCount = PrItemAssignment::where('pr_id', $pr->id)
            ->whereIn('status', ['in_tender', 'cs_assigned'])->count();
        if ($assignedCount >= $totalItems) {
            $pr->update(['status' => 'tendered']);
        }

        return back()->with('success', 'CS assigned to item successfully.');
    }

    public function destroy(Pr $pr) {
        $pr->delete();
        return back()->with('success', 'PR deleted');
    }
}
