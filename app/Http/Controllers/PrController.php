<?php
namespace App\Http\Controllers;

use App\Models\Pr;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
        return Inertia::render('PRs', ['prs' => Pr::orderByDesc('created_at')->get()]);
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

    public function destroy(Pr $pr) {
        $pr->delete();
        return back()->with('success', 'PR deleted');
    }
}
