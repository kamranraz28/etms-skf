<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRole;
use Inertia\Inertia;

class UserController extends Controller {
    public function index() {
        $users = User::with('roles:id,user_id,role')->orderByDesc('created_at')->get();
        $rows = $users->map(fn($u) => [
            'id' => $u->id, 'full_name' => $u->full_name, 'email' => $u->email,
            'roles' => $u->roles->pluck('role')->all(),
        ]);
        return Inertia::render('Users', ['rows' => $rows]);
    }

    public function toggleRole(User $user, string $role) {
        $allowed = ['admin','procurement','approver','vendor','department_head','executive_director','counter_ed','scm_head','finance_head','line_manager'];
        abort_unless(in_array($role, $allowed, true), 422);
        $existing = UserRole::where('user_id', $user->id)->where('role', $role)->first();
        if ($existing) $existing->delete();
        else UserRole::create(['user_id' => $user->id, 'role' => $role]);
        return back();
    }
}
