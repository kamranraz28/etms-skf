<?php

namespace App\Notifications;

use App\Models\BidPriceNegotiation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SettledPriceOffered extends Notification
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
        return [
            'type' => 'price_offer',
            'negotiation_id' => $this->negotiation->id,
            'bid_id' => $this->negotiation->bid_id,
            'tender_id' => $this->negotiation->tender_id,
            'tender_number' => $this->negotiation->tender?->tender_number,
            'item_name' => $this->negotiation->item_name,
            'old_price' => $this->negotiation->old_price,
            'offered_price' => $this->negotiation->offered_price,
            'title' => 'Authority proposes a settled price',
            'message' => sprintf(
                'Authority proposes %s BDT/unit for "%s" in tender %s (your price: %s BDT/unit). Accept, deny, or send a counter offer.',
                number_format((float) $this->negotiation->offered_price, 2),
                $this->negotiation->item_name,
                $this->negotiation->tender?->tender_number ?? '',
                number_format((float) $this->negotiation->old_price, 2),
            ),
            'url' => '/app/my-bids/' . $this->negotiation->bid_id . '?tab=offers',
        ];
    }
}
