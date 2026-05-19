<?php

namespace App\Listeners;

use App\Events\VendorCreated;
use App\Mail\VendorWelcomeMail;
use Illuminate\Support\Facades\Mail;

class SendVendorWelcomeEmail
{
    public function handle(VendorCreated $event): void
    {
        $vendor = $event->vendor;

        if (!filter_var($vendor->email, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        Mail::to($vendor->email)->send(
            new VendorWelcomeMail($vendor, $event->password)
        );
    }
}
