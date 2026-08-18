<?php

namespace App\Notifications;

use App\Models\BidPriceNegotiation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PriceOfferResponded extends Notification
{
    use Queueable;

    public function __construct(public BidPriceNegotiation $negotiation)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $response = match ($this->negotiation->status) {
            'accepted' => 'accepted',
            'counter' => 'sent a counter offer of ' . number_format((float) $this->negotiation->counter_price, 2) . ' BDT/unit',
            default => 'denied',
        };

        return [
            'type' => 'price_response',
            'negotiation_id' => $this->negotiation->id,
            'bid_id' => $this->negotiation->bid_id,
            'tender_id' => $this->negotiation->tender_id,
            'tender_number' => $this->negotiation->tender?->tender_number,
            'item_name' => $this->negotiation->item_name,
            'vendor_name' => $this->negotiation->vendor?->name,
            'offered_price' => $this->negotiation->offered_price,
            'response' => $this->negotiation->status,
            'title' => 'Vendor responded to settled price',
            'message' => sprintf(
                'Vendor "%s" %s your settled price of %s BDT/unit for "%s" in tender %s.',
                $this->negotiation->vendor?->name ?? '—',
                $response,
                number_format((float) $this->negotiation->offered_price, 2),
                $this->negotiation->item_name,
                $this->negotiation->tender?->tender_number ?? '',
            ),
            'url' => '/app/tenders/' . $this->negotiation->tender_id,
        ];
    }
}
