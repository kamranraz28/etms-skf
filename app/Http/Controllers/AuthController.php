<?php
namespace App\Http\Controllers;

use App\Events\VendorCreated;
use App\Mail\LoginAlertMail;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AuthController extends Controller {
    public function show() { return Inertia::render('Auth'); }

    public function login(Request $r) {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required']);

        $alertEnabled = Setting::isEnabled('login_alert_enabled');

        if ($alertEnabled) {
            $user = User::where('email', $data['email'])->first();

            if ($user && $user->locked_until && $user->locked_until > now()) {
                $minutes = now()->diffInMinutes($user->locked_until);
                $hours = floor($minutes / 60);
                $mins = $minutes % 60;
                $msg = $hours > 0
                    ? "Too many login attempts. Your account is locked for another {$hours}h {$mins}m."
                    : "Too many login attempts. Your account is locked for another {$mins} minutes.";
                return back()->withErrors(['email' => $msg]);
            }

            if (! $user || ! Auth::attempt($data, true)) {
                if ($user) {
                    $user->increment('login_attempts');
                    if ($user->login_attempts >= 5) {
                        $user->update([
                            'locked_until' => now()->addHour(),
                            'login_attempts' => 0,
                        ]);
                        $user->refresh();
                        Mail::to(Setting::get('login_alert_email'))->send(
                            new LoginAlertMail($user, $r->ip())
                        );
                        return back()->withErrors([
                            'email' => 'Too many login attempts. Your account has been locked for 1 hour.'
                        ]);
                    }
                }
                return back()->withErrors(['email' => 'Invalid credentials.']);
            }

            $user->update(['login_attempts' => 0, 'locked_until' => null]);
        } else {
            if (! Auth::attempt($data, true)) {
                return back()->withErrors(['email' => 'Invalid credentials.']);
            }
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

    public function unlock(string $email) {
        $user = User::where('email', $email)->first();
        if (! $user) {
            return view('unlock-account', ['status' => 'not-found']);
        }
        $user->update(['login_attempts' => 0, 'locked_until' => null]);
        return view('unlock-account', ['status' => 'unlocked', 'email' => $email]);
    }

    public function logout(Request $r) {
        Auth::logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();
        return redirect()->route('auth.show');
    }
}
