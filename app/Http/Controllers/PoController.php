<?php
namespace App\Http\Controllers;

use App\Models\Po;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PoController extends Controller {
    private const MOCK_POS = [
        ['vendor_erp_code' => 'V001', 'po_date' => '2026-05-20',
         'items' => [['name' => 'Cisco Catalyst 1300 24-port', 'qty' => 6, 'unit_price' => 25000, 'total_price' => 150000]]],
        ['vendor_erp_code' => 'V002', 'po_date' => '2026-05-19',
         'items' => [['name' => 'Cut-resistant Gloves L', 'qty' => 500, 'unit_price' => 120, 'total_price' => 60000],
                     ['name' => 'Safety Goggles', 'qty' => 300, 'unit_price' => 45, 'total_price' => 13500]]],
        ['vendor_erp_code' => 'V003', 'po_date' => '2026-05-18',
         'items' => [['name' => 'Café Tables 4-seat', 'qty' => 20, 'unit_price' => 8500, 'total_price' => 170000]]],
    ];

    public function index() {
        return Inertia::render('POs', ['pos' => Po::orderByDesc('created_at')->get()]);
    }

    public function sync() {
        $pick = self::MOCK_POS[array_rand(self::MOCK_POS)];
        $number = 'PO-' . date('Y') . '-' . random_int(100, 999);
        Po::create([
            'po_number' => $number,
            'vendor_erp_code' => $pick['vendor_erp_code'],
            'items' => $pick['items'],
            'po_date' => $pick['po_date'],
            'status' => 'new',
        ]);
        return back()->with('success', "Synced $number from ERP");
    }

    public function store(Request $r) {
        $data = $r->validate([
            'po_number' => 'required|string|unique:pos,po_number',
            'vendor_erp_code' => 'nullable|string',
            'po_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total_price' => 'required|numeric|min:0',
        ]);
        $data['status'] = 'new';
        Po::create($data);
        return back()->with('success', 'PO created');
    }

    public function destroy(Po $po) {
        $po->delete();
        return back()->with('success', 'PO deleted');
    }
}
