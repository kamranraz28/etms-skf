<?php

namespace App\Listeners;

use App\Events\TenderCreated;
use App\Mail\TenderInvitationMail;
use Illuminate\Support\Facades\Mail;

class SendTenderInvitation
{
    public function handle(TenderCreated $event): void
    {
        $tender = $event->tender;
        $vendors = $tender->vendors;

        foreach ($vendors as $vendor) {
            if (!filter_var($vendor->email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            Mail::to($vendor->email)->send(
                new TenderInvitationMail($tender, $vendor)
            );
        }
    }
}
