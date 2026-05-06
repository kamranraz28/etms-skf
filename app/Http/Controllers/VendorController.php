<?php
namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller {
    public function index() {
        $vendors = Vendor::orderByDesc('created_at')->get();
        return Inertia::render('Vendors', ['vendors' => $vendors]);
    }
    public function store(Request $r) {
        $data = $r->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'erp_code' => 'nullable|string',
            'status' => 'required|in:pending,active,inactive,blacklisted',
            'notes' => 'nullable|string',
        ]);
        $data['email'] = strtolower($data['email']);
        Vendor::create($data);
        return back()->with('success', 'Vendor created');
    }
    public function update(Request $r, Vendor $vendor) {
        $data = $r->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'erp_code' => 'nullable|string',
            'status' => 'required|in:pending,active,inactive,blacklisted',
            'notes' => 'nullable|string',
        ]);
        $data['email'] = strtolower($data['email']);
        $vendor->update($data);
        return back()->with('success', 'Vendor updated');
    }
    public function destroy(Vendor $vendor) {
        $vendor->delete();
        return back()->with('success', 'Vendor deleted');
    }
}
