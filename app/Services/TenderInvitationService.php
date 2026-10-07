<?php
namespace App\Services;

use App\Mail\TenderInvitationMail;
use App\Models\Tender;
use App\Models\TenderItemCategory;
use App\Models\TenderVendor;
use App\Models\Vendor;
use Illuminate\Support\Facades\Mail;

class TenderInvitationService
{
    /**
     * Invite a vendor to every open tender whose item categories overlap
     * with the vendor's categories. Idempotent — existing rows are kept.
     * Returns the number of new invitations created.
     */
    public static function inviteVendorToOpenTenders(Vendor $vendor): int
    {
        if ($vendor->status !== 'active') {
            return 0;
        }
        $catIds = $vendor->categories()->pluck('vendor_categories.id')->all();
        if (empty($catIds)) {
            return 0;
        }
        $tenderIds = TenderItemCategory::whereIn('vendor_category_id', $catIds)
            ->whereHas('tender', fn ($q) => $q->where('status', 'open'))
            ->distinct()
            ->pluck('tender_id')
            ->all();

        $added = 0;
        foreach ($tenderIds as $tid) {
            $row = TenderVendor::firstOrCreate(['tender_id' => $tid, 'vendor_id' => $vendor->id]);
            if ($row->wasRecentlyCreated) {
                $added++;
                $tender = Tender::find($tid);
                if ($tender && filter_var($vendor->email, FILTER_VALIDATE_EMAIL)) {
                    Mail::to($vendor->email)->send(new TenderInvitationMail($tender, $vendor));
                }
            }
        }
        return $added;
    }
}
