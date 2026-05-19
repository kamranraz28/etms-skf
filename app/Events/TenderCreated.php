<?php

namespace App\Events;

use App\Models\Tender;
use Illuminate\Foundation\Events\Dispatchable;

class TenderCreated
{
    use Dispatchable;

    public function __construct(
        public Tender $tender,
    ) {}
}
