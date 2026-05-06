<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::orderByDesc('created_at')->get();
        return Inertia::render('Vendors', ['vendors' => $vendors]);
    }
    public function store(Request $r)
    {
        $data = $r->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'erp_code' => 'nullable|string',
            'status' => 'required|in:pending,active,inactive,blacklisted',
            'notes' => 'nullable|string',
        ]);
        $data['email'] = strtolower($data['email']);

        //create user if not there by this email
        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            $user = User::create([
                'full_name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt('password'),
                'role' => 'vendor',
            ]);

            UserRole::create(['user_id' => $user->id, 'role' => 'vendor']);
        }
        //create vendor with data and user_id

        $lastVendor = Vendor::latest('id')->first();

        $nextNumber = $lastVendor
            ? ((int) str_replace('V', '', $lastVendor->erp_code)) + 1
            : 100001;

        $erpCode = 'V' . $nextNumber;

        Vendor::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'erp_code' => $erpCode,
            'status' => $data['status'],
            'notes' => $data['notes'],
            'user_id' => $user->id,
        ]);
        return back()->with('success', 'Vendor created');
    }
    public function update(Request $r, Vendor $vendor)
    {
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
    public function destroy(Vendor $vendor)
    {
        $vendor->delete();
        return back()->with('success', 'Vendor deleted');
    }
}
