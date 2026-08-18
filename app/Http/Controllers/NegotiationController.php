<?php

namespace App\Http\Controllers;

use App\Models\Bid;
use App\Models\BidPriceNegotiation;
use App\Models\CsItem;
use App\Models\CsItemSelection;
use App\Models\Tender;
use App\Models\User;
use App\Notifications\PriceOfferResponded;
use App\Notifications\SettledPriceOffered;
use Illuminate\Http\Request;

class NegotiationController extends Controller
{
    public function offer(Request $r, Tender $tender, Bid $bid)
    {
        if ($tender->status === 'awarded') {
            return back()->with('error', 'Tender is already awarded.');
        }
        if ($bid->tender_id !== $tender->id) {
            return back()->with('error', 'Bid does not belong to this tender.');
        }

        $data = $r->validate([
            'offers' => 'required|array|min:1',
            'offers.*.item_name' => 'required|string',
            'offers.*.offered_price' => 'required|numeric|min:0.01',
        ]);

        $itemNames = collect($data['offers'])->pluck('item_name')->all();
        $bidItems = $bid->item_prices ?? [];
        $validNames = collect($bidItems)->pluck('name')->all();
        foreach ($itemNames as $name) {
            if (! in_array($name, $validNames, true)) {
                return back()->with('error', "Item \"{$name}\" is not part of this bid.");
            }
        }

        $created = 0;
        foreach ($data['offers'] as $offer) {
            $row = $bid->priceForItem($offer['item_name']);
            $old = (float) ($row['unit_price'] ?? 0);

            // Update an existing pending round instead of stacking duplicates
            $pending = BidPriceNegotiation::where('bid_id', $bid->id)
                ->where('item_name', $offer['item_name'])
                ->where('status', 'pending')->first();

            if ($pending) {
                $pending->update([
                    'old_price' => $old,
                    'offered_price' => $offer['offered_price'],
                    'offered_by' => $r->user()->id,
                ]);
                $pending->refresh();
            } else {
                $pending = BidPriceNegotiation::create([
                    'bid_id' => $bid->id,
                    'tender_id' => $tender->id,
                    'vendor_id' => $bid->vendor_id,
                    'item_name' => $offer['item_name'],
                    'old_price' => $old,
                    'offered_price' => $offer['offered_price'],
                    'status' => 'pending',
                    'offered_by' => $r->user()->id,
                ]);
                $created++;
            }
            $vendorUser = $bid->vendor?->user;
            if ($vendorUser) {
                $vendorUser->notify(new SettledPriceOffered($pending));
            }
        }

        return back()->with('success', "Settled price offer(s) sent to vendor. ($created new)");
    }

    public function accept(Request $r, BidPriceNegotiation $negotiation)
    {
        $this->authorizeVendorResponse($r, $negotiation);
        if ($negotiation->status !== 'pending') return back()->with('error', 'This offer has already been responded to.');

        $negotiation->update(['status' => 'accepted', 'responded_at' => now()]);
        $negotiation->bid->setPriceForItem($negotiation->item_name, (float) $negotiation->offered_price);
        $this->propagateToCs($negotiation->bid, $negotiation->item_name);

        $this->notifyStaff($negotiation);
        return back()->with('success', 'Offer accepted. Your bid price has been updated.');
    }

    public function reject(Request $r, BidPriceNegotiation $negotiation)
    {
        $this->authorizeVendorResponse($r, $negotiation);
        if ($negotiation->status !== 'pending') return back()->with('error', 'This offer has already been responded to.');

        $negotiation->update([
            'status' => 'rejected',
            'vendor_comment' => $r->input('vendor_comment') ?: null,
            'responded_at' => now(),
        ]);

        $this->notifyStaff($negotiation);
        return back()->with('success', 'Offer denied. Your original bid price stays unchanged.');
    }

    public function counter(Request $r, BidPriceNegotiation $negotiation)
    {
        $this->authorizeVendorResponse($r, $negotiation);
        if ($negotiation->status !== 'pending') return back()->with('error', 'This offer has already been responded to.');

        $data = $r->validate([
            'counter_price' => 'required|numeric|min:0.01',
            'vendor_comment' => 'nullable|string',
        ]);

        $negotiation->update([
            'status' => 'counter',
            'counter_price' => $data['counter_price'],
            'vendor_comment' => $data['vendor_comment'] ?? null,
            'responded_at' => now(),
        ]);
        $negotiation->bid->setPriceForItem($negotiation->item_name, (float) $data['counter_price']);
        $this->propagateToCs($negotiation->bid, $negotiation->item_name);

        $this->notifyStaff($negotiation);
        return back()->with('success', 'Counter offer submitted. Your bid price has been updated.');
    }

    protected function authorizeVendorResponse(Request $r, BidPriceNegotiation $negotiation): void
    {
        $vendor = $negotiation->bid->vendor;
        if (! $vendor || $vendor->user_id !== $r->user()->id) {
            abort(403, 'You can only respond to offers on your own bids.');
        }
        if ($negotiation->tender && $negotiation->tender->status === 'awarded') {
            abort(422, 'Tender is already awarded.');
        }
    }

    protected function propagateToCs(Bid $bid, string $itemName): void
    {
        $tender = $bid->tender;
        if (! $tender) return;
        $cs = $tender->cs;
        if (! $cs) return;

        $prItems = $tender->pr->items ?? [];
        $itemIndex = null;
        foreach ($prItems as $idx => $prItem) {
            if (($prItem['name'] ?? null) === $itemName) { $itemIndex = $idx; break; }
        }

        if ($itemIndex !== null) {
            CsItemSelection::where('cs_id', $cs->id)
                ->where('bid_id', $bid->id)
                ->where('item_index', $itemIndex)
                ->update(['unit_price' => $bid->priceForItem($itemName)['unit_price'] ?? 0]);
        }

        $csItem = CsItem::where('cs_id', $cs->id)->where('bid_id', $bid->id)->first();
        if ($csItem) {
            $csItem->update(['total_price' => $bid->total_price]);
            // Re-rank all items for this CS
            $items = CsItem::where('cs_id', $cs->id)->orderBy('total_price')->get();
            foreach ($items as $i => $it) {
                $it->update(['rank' => $i + 1]);
            }
        }
    }

    protected function notifyStaff(BidPriceNegotiation $negotiation): void
    {
        $staff = User::whereHas('roles', fn ($q) => $q->whereIn('role', ['admin', 'procurement']))
            ->get();
        foreach ($staff as $user) {
            $user->notify(new PriceOfferResponded($negotiation));
        }
    }
}
