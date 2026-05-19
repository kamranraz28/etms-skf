<?php
namespace App\Http\Controllers;

use App\Events\VendorCreated;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller {
    public function show() { return Inertia::render('Auth'); }

    public function login(Request $r) {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required']);
        if (! Auth::attempt($data, true)) {
            return back()->with('error', 'Invalid credentials.');
        }
        $r->session()->regenerate();
        return redirect()->route('app.dashboard')->with('success', 'Signed in');
    }

    public function register(Request $r) {
        $data = $r->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,procurement,approver,vendor',
        ]);
        $user = User::create([
            'full_name' => $data['full_name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
        ]);
        UserRole::create(['user_id' => $user->id, 'role' => $data['role']]);
        if ($data['role'] === 'vendor') {
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'name' => $data['full_name'],
                'email' => strtolower($data['email']),
                'status' => 'pending',
            ]);
            event(new VendorCreated($vendor, $data['password']));
        }
        return back()->with('success', 'Account created. You can sign in now.');
    }

    public function logout(Request $r) {
        Auth::logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();
        return redirect()->route('home');
    }
}
