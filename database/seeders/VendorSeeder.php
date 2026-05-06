<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['vendor1@etms.test', 'Acme Industrial Pvt Ltd', 'V100245', 'active'],
            ['vendor2@etms.test', 'Globex Supplies Ltd', 'V100246', 'active'],
            ['vendor3@etms.test', 'Initech Solutions', 'V100247', 'active'],
        ];
        foreach ($rows as [$email, $name, $erp, $status]) {
            $u = User::where('email', $email)->first();
            Vendor::updateOrCreate(['email' => $email], [
                'user_id' => $u?->id, 'name' => $name, 'erp_code' => $erp, 'status' => $status,
                'phone' => '+91-9000000000',
            ]);
        }
    }
}
