<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $categories = VendorCategory::pluck('id')->toArray();

        $rows = [
            ['vendor1@etms.test', 'Acme Industrial Pvt Ltd', 'V100001', 'active', '01609758311'],
            ['vendor2@etms.test', 'Global Supplies Ltd', 'V100002', 'active', '01712345678'],
            ['vendor3@etms.test', 'TechSolve Inc', 'V100003', 'pending', '01811112222'],
        ];
        foreach ($rows as [$email, $name, $erp, $status, $phone]) {
            $u = User::where('email', $email)->first();
            Vendor::updateOrCreate(['email' => $email], [
                'user_id' => $u?->id, 'name' => $name, 'erp_code' => $erp, 'status' => $status,
                'phone' => $phone, 'vendor_category_id' => $categories[array_rand($categories)],
            ]);
        }
    }
}
