<?php

namespace App\Events;

use App\Models\Vendor;
use Illuminate\Foundation\Events\Dispatchable;

class VendorCreated
{
    use Dispatchable;

    public function __construct(
        public Vendor $vendor,
        public string $password = 'password',
    ) {}
}
