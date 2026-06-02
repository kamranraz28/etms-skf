<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['Admin User', 'admin@etms.test', ['admin']],
            ['Procurement User', 'procurement@etms.test', ['procurement']],
            ['Approver User', 'approver@etms.test', ['approver']],
            ['Dept Head User', 'depthead@etms.test', ['department_head']],
            ['ED User', 'ed@etms.test', ['executive_director']],
            ['Counter ED User', 'countered@etms.test', ['counter_ed']],
            ['SCM Head User', 'scmhead@etms.test', ['scm_head']],
            ['Finance Head User', 'financehead@etms.test', ['finance_head']],
            ['Line Manager User', 'linemanager@etms.test', ['line_manager']],
            ['User Role', 'user@etms.test', ['user']],
            ['Unit Head User', 'unithead@etms.test', ['unit_head']],
            ['SCM User', 'scmuser@etms.test', ['scm_user']],
            ['Acme Vendor', 'vendor1@etms.test', ['vendor']],
            ['Globex Vendor', 'vendor2@etms.test', ['vendor']],
            ['Initech Vendor', 'vendor3@etms.test', ['vendor']],
        ];
        foreach ($accounts as [$name, $email, $roles]) {
            $u = User::firstOrCreate(['email' => $email], [
                'full_name' => $name, 'password' => Hash::make('password'),
            ]);
            foreach ($roles as $r) UserRole::firstOrCreate(['user_id' => $u->id, 'role' => $r]);
        }
    }
}
