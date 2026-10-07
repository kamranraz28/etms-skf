<?php
namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\UserRole;
use App\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /** Permission catalog: slug => [label, group]. */
    public const PERMISSIONS = [
        // Staff pages
        'vendors.view' => ['View vendors', 'Staff'],
        'vendors.manage' => ['Create / edit / delete vendors', 'Staff'],
        'vendor_categories.view' => ['View vendor categories', 'Staff'],
        'vendor_categories.manage' => ['Manage vendor categories', 'Staff'],
        'prs.view' => ['View purchase requisitions', 'Staff'],
        'prs.manage' => ['Create / sync PRs', 'Staff'],
        'pos.view' => ['View purchase orders', 'Staff'],
        'pos.manage' => ['Create / sync POs', 'Staff'],
        'tenders.view' => ['View tenders & bids', 'Staff'],
        'tenders.manage' => ['Create / close / invite / generate CS', 'Staff'],
        'tenders.negotiate' => ['Settle bid prices', 'Staff'],
        'bids.documents' => ['Download bid documents', 'Staff'],
        'cs.view' => ['View comparative statements', 'Staff'],
        'cs.manage' => ['Award items / submit CS', 'Staff'],
        'cs.decide' => ['Approve / decline CS', 'Staff'],
        'cs.erp' => ['Push CS to ERP', 'Staff'],
        'claims.view' => ['View claims', 'Staff'],
        'claims.decide' => ['Decide claims', 'Staff'],
        'claims.view_all' => ['See all claims + filters', 'Staff'],
        'claims.history' => ['View claims history', 'Staff'],
        // Administration
        'users.manage' => ['Manage users', 'Administration'],
        'roles.manage' => ['Manage roles & permissions', 'Administration'],
        'workflow.manage' => ['Manage workflow types', 'Administration'],
        'settings.manage' => ['Manage settings', 'Administration'],
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $slug => [$label, $group]) {
            Permission::firstOrCreate(['slug' => $slug], ['label' => $label, 'group' => $group]);
        }

        // Every role slug currently referenced anywhere becomes a managed role.
        $slugs = collect(UserRole::distinct()->pluck('role')->all())
            ->merge(WorkflowStep::distinct()->pluck('role_name')->all())
            ->map(fn ($s) => strtolower(trim((string) $s)))
            ->filter()
            ->unique()
            ->values();
        foreach ($slugs as $slug) {
            Role::firstOrCreate(['slug' => $slug], [
                'label' => ucfirst(str_replace('_', ' ', $slug)),
                'is_system' => in_array($slug, ['admin', 'vendor'], true),
            ]);
        }
        Role::firstOrCreate(['slug' => 'admin'], ['label' => 'Admin', 'is_system' => true]);
        Role::firstOrCreate(['slug' => 'vendor'], ['label' => 'Vendor', 'is_system' => true]);

        // Grants mirror the previous hardcoded route access.
        $staffView = [
            'vendors.view', 'vendor_categories.view', 'prs.view', 'pos.view',
            'tenders.view', 'cs.view', 'claims.view',
        ];
        $staffManage = [
            'prs.manage', 'pos.manage', 'tenders.manage',
            'cs.manage', 'cs.decide', 'cs.erp',
        ];
        // Roles that could previously open claim/tender decision pages.
        $deciders = [
            'admin', 'procurement', 'approver', 'user', 'line_manager',
            'unit_head', 'executive_director', 'scm_user', 'scm_head', 'finance_head',
        ];

        $grants = [];
        foreach (Role::pluck('slug')->all() as $slug) {
            if ($slug === 'admin') {
                $grants[$slug] = array_keys(self::PERMISSIONS);
                continue;
            }
            if ($slug === 'vendor') {
                $grants[$slug] = [];
                continue;
            }
            $perms = array_merge($staffView, $staffManage, ['bids.documents']);
            if (in_array($slug, $deciders, true)) {
                $perms[] = 'claims.decide';
            }
            if ($slug === 'procurement') {
                $perms[] = 'tenders.negotiate';
            }
            $grants[$slug] = array_values(array_unique($perms));
        }

        foreach ($grants as $slug => $perms) {
            $role = Role::where('slug', $slug)->first();
            if (! $role) continue;
            $ids = Permission::whereIn('slug', $perms)->pluck('id')->all();
            $role->permissions()->sync($ids);
        }
    }
}
