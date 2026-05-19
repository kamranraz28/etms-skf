<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            VendorCategorySeeder::class,
            VendorSeeder::class,
            PrSeeder::class,
            TenderSeeder::class,
            BidSeeder::class,
            ClaimSeeder::class,
        ]);
    }
}
