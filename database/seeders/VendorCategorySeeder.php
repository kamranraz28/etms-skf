<?php

namespace Database\Seeders;

use App\Models\VendorCategory;
use Illuminate\Database\Seeder;

class VendorCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics'],
            ['name' => 'Construction'],
            ['name' => 'IT Services'],
            ['name' => 'Office Supplies'],
            ['name' => 'Logistics'],
        ];

        foreach ($categories as $category) {
            VendorCategory::updateOrCreate(['name' => $category['name']], $category);
        }
    }
}
