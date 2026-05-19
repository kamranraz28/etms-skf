<?php

namespace App\Events;

use App\Models\Cs;
use Illuminate\Foundation\Events\Dispatchable;

class CsApprovedByApprover
{
    use Dispatchable;

    public function __construct(
        public Cs $cs,
    ) {}
}
