<?php
namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorProfileController extends Controller {
    public function show(Request $r) {
        $vendor = Vendor::where('user_id', $r->user()->id)->first();
        return Inertia::render('VendorProfile', ['vendor' => $vendor]);
    }
    public function save(Request $r) {
        $data = $r->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $data['email'] = strtolower($data['email']);
        $vendor = Vendor::where('user_id', $r->user()->id)->first();
        if ($vendor) {
            if ($vendor->status !== 'pending') return back()->with('error', 'Profile is locked once approved.');
            $vendor->update($data);
            return back()->with('success', 'Profile saved');
        }
        Vendor::create(array_merge($data, ['user_id' => $r->user()->id, 'status' => 'pending']));
        return back()->with('success', 'Registered. An admin will review your application.');
    }
}
