<?php

namespace App\Listeners;

use App\Events\CsApprovedByApprover;
use App\Mail\CsSelectionConfirmationMail;
use Illuminate\Support\Facades\Mail;

class SendCsSelectionConfirmation
{
    public function handle(CsApprovedByApprover $event): void
    {
        $cs = $event->cs;
        $cs->load([
            'tender',
            'selections' => fn($q) => $q->where('selected', true),
            'selections.vendor',
        ]);

        $grouped = $cs->selections->groupBy('vendor_id');

        foreach ($grouped as $vendorId => $selections) {
            $vendor = $selections->first()->vendor;
            if (!filter_var($vendor->email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            Mail::to($vendor->email)->send(
                new CsSelectionConfirmationMail($cs, $vendor, $selections->toArray())
            );
        }
    }
}
