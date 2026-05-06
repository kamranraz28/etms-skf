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
            ['vendor1@etms.test', 'Acme Industrial Pvt Ltd', 'V100001', 'active', '01609758311'],
            ['vendor2@etms.test', 'Globex Supplies Ltd', 'V100002', 'active', '01609758312'],
            ['vendor3@etms.test', 'Initech Solutions', 'V100003', 'active', '01609758313'],
        ];
        foreach ($rows as [$email, $name, $erp, $status, $phone]) {
            $u = User::where('email', $email)->first();
            Vendor::updateOrCreate(['email' => $email], [
                'user_id' => $u?->id, 'name' => $name, 'erp_code' => $erp, 'status' => $status,
                'phone' => $phone,
            ]);
        }
    }
}
