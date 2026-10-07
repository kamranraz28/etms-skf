<?php
namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\UserRole;
use App\Models\WorkflowStep;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions:id,slug')->orderBy('label')->get()->map(fn ($r) => [
            'id' => $r->id,
            'slug' => $r->slug,
            'label' => $r->label,
            'is_system' => (bool) $r->is_system,
            'users_count' => $r->usersCount(),
            'workflow_usage' => $r->workflowUsageCount(),
            'permissions' => $r->permissions->pluck('slug')->all(),
        ]);
        $permissions = Permission::orderBy('group')->orderBy('label')->get()
            ->groupBy('group')
            ->map(fn ($items) => $items->map(fn ($p) => [
                'slug' => $p->slug, 'label' => $p->label,
            ])->values()->all())
            ->all();

        return Inertia::render('Roles', compact('roles', 'permissions'));
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'label' => 'required|string|max:100',
        ]);
        $slug = Str::slug($data['label'], '_');
        if (Role::where('slug', $slug)->exists()) {
            return back()->withErrors(['label' => 'A role with a similar name already exists.']);
        }
        Role::create(['slug' => $slug, 'label' => $data['label'], 'is_system' => false]);
        return back()->with('success', 'Role created');
    }

    public function update(Request $r, Role $role)
    {
        $data = $r->validate(['label' => 'required|string|max:100']);
        $role->update(['label' => $data['label']]);
        return back()->with('success', 'Role updated');
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be deleted.');
        }
        if (UserRole::where('role', $role->slug)->exists()) {
            return back()->with('error', 'This role is assigned to users. Remove it from all users first.');
        }
        if (WorkflowStep::where('role_name', $role->slug)->exists()) {
            return back()->with('error', 'This role is used in workflow steps. Remove it from all workflows first.');
        }
        $role->delete();
        return back()->with('success', 'Role deleted');
    }

    public function updatePermissions(Request $r, Role $role)
    {
        $data = $r->validate([
            'permissions' => 'present|array',
            'permissions.*' => 'string|exists:permissions,slug',
        ]);
        $ids = Permission::whereIn('slug', $data['permissions'])->pluck('id')->all();
        $role->permissions()->sync($ids);
        return back()->with('success', 'Permissions updated');
    }
}
