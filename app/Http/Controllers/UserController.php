<?php
namespace App\Http\Controllers;

use App\Events\VendorCreated;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller {
    /** Slugs of roles that currently exist — the assignable set is fully dynamic. */
    protected static function allowedRoles(): array
    {
        return Role::pluck('slug')->all();
    }
    public function index() {
        $users = User::with('roles:id,user_id,role')->orderByDesc('created_at')->get();
        $rows = $users->map(fn($u) => [
            'id' => $u->id, 'full_name' => $u->full_name, 'email' => $u->email,
            'roles' => $u->roles->pluck('role')->all(),
        ]);
        $roles = Role::orderBy('label')->get()->map(fn ($r) => [
            'value' => $r->slug, 'label' => $r->label,
        ])->all();
        return Inertia::render('Users', ['rows' => $rows, 'roles' => $roles]);
    }

    public function toggleRole(User $user, string $role) {
        abort_unless(Role::where('slug', $role)->exists(), 422);
        $existing = UserRole::where('user_id', $user->id)->where('role', $role)->first();
        if ($existing) $existing->delete();
        else UserRole::create(['user_id' => $user->id, 'role' => $role]);
        return back();
    }

    public function store(Request $r) {
        $data = $r->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'roles' => 'required|array|min:1',
            'roles.*' => 'string|exists:roles,slug',
        ]);
        $user = User::create([
            'full_name' => $data['full_name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
        ]);
        foreach ($data['roles'] as $role) {
            UserRole::create(['user_id' => $user->id, 'role' => $role]);
        }
        if (in_array('vendor', $data['roles'], true)) {
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'name' => $data['full_name'],
                'email' => strtolower($data['email']),
                'status' => 'pending',
            ]);
            event(new VendorCreated($vendor, $data['password']));
        }
        return back()->with('success', 'User created');
    }

    public function update(Request $r, User $user) {
        $data = $r->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'roles' => 'required|array|min:1',
            'roles.*' => 'string|exists:roles,slug',
        ]);
        $user->update([
            'full_name' => $data['full_name'],
            'email' => strtolower($data['email']),
            ...(! empty($data['password'] ?? null) ? ['password' => Hash::make($data['password'])] : []),
        ]);
        UserRole::where('user_id', $user->id)->delete();
        foreach ($data['roles'] as $role) {
            UserRole::create(['user_id' => $user->id, 'role' => $role]);
        }
        if (in_array('vendor', $data['roles'], true) && ! Vendor::where('user_id', $user->id)->exists()) {
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'name' => $data['full_name'],
                'email' => strtolower($data['email']),
                'status' => 'pending',
            ]);
            event(new VendorCreated($vendor, $data['password'] ?? 'password'));
        }
        return back()->with('success', 'User updated');
    }

    public function destroy(User $user, Request $r) {
        if ($user->id === $r->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }
        $vendor = Vendor::where('user_id', $user->id)->first();
        if ($vendor && \App\Models\Bid::where('vendor_id', $vendor->id)->exists()) {
            return back()->with('error', 'This user owns bids and cannot be deleted.');
        }
        if ($user->hasRole('admin') && UserRole::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Cannot delete the last admin.');
        }
        if ($vendor) $vendor->delete();
        $user->delete();
        return back()->with('success', 'User deleted');
    }
}
