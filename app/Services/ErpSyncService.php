<?php
namespace App\Services;

use App\Models\Cs;
use App\Models\ErpSync;
use Illuminate\Support\Facades\Http;

class ErpSyncService
{
    public function push(Cs $cs): array
    {
        if ($cs->status !== 'approved') throw new \RuntimeException('CS not approved.');

        $cs->load('tender.pr', 'selections.vendor');
        $byVendor = [];
        foreach ($cs->selections->where('selected', true) as $s) {
            $vid = $s->vendor_id;
            $byVendor[$vid] ??= ['vendor_erp_code' => $s->vendor->erp_code, 'vendor_name' => $s->vendor->name, 'lines' => []];
            $pr = $cs->tender->pr->items[$s->item_index] ?? null;
            $byVendor[$vid]['lines'][] = [
                'item' => $pr['name'] ?? null, 'qty' => $s->qty, 'unit' => $pr['unit'] ?? null,
                'unit_price' => $s->unit_price, 'line_total' => $s->qty * $s->unit_price,
            ];
        }

        $payload = [
            'cs_id' => $cs->id,
            'tender_number' => $cs->tender->tender_number,
            'pr_number' => $cs->tender->pr->pr_number,
            'purchase_orders' => array_values($byVendor),
            'erp_reference' => 'ERP-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8)),
        ];

        // Mock push (can be wired to real ERP via HTTP)
        $url = config('services.erp.webhook_url');
        $response = ['ok' => true, 'erp_reference' => $payload['erp_reference'], 'echo' => $payload];
        if ($url && str_starts_with($url, 'http')) {
            try { Http::timeout(5)->post($url, $payload); } catch (\Throwable $e) {}
        }

        ErpSync::create([
            'cs_id' => $cs->id, 'status' => 'success',
            'request_payload' => $payload, 'response_data' => $response, 'synced_at' => now(),
        ]);
        return $response;
    }
}
