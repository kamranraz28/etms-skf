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

        $cs->load([
            'tender.pr',
            'selections.vendor',
        ]);

        $pr = $cs->tender->pr;
        $selectedSelections = $cs->selections->where('selected', true);

        $items = [];
        foreach ($selectedSelections as $s) {
            $prItem = $pr->items[$s->item_index] ?? null;
            $items[] = [
                'item' => $s->item_index + 1,
                'name' => $prItem['name'] ?? null,
                'qty' => (float) $s->qty,
                'unit' => $prItem['unit'] ?? null,
                'assigned_vendor_erp' => $s->vendor->erp_code ?? null,
                'assigned_vendor_name' => $s->vendor->name ?? null,
                'unit_price' => (float) $s->unit_price,
                'total_price' => (float) ($s->qty * $s->unit_price),
            ];
        }

        $payload = [
            'cs_number' => 'CS-' . $cs->id,
            'pr_number' => $pr->pr_number ?? null,
            'approved_at' => $cs->approved_at?->toIso8601String(),
            'items' => $items,
        ];

        $url = config('services.erp.webhook_url');
        $response = ['ok' => true];

        if ($url && str_starts_with($url, 'http')) {
            try {
                $httpResponse = Http::timeout(10)->post($url, $payload);
                $response['http_status'] = $httpResponse->status();
                $response['http_body'] = $httpResponse->body();
            } catch (\Throwable $e) {
                $response['error'] = $e->getMessage();
            }
        }

        ErpSync::create([
            'cs_id' => $cs->id, 'status' => 'success',
            'request_payload' => $payload, 'response_data' => $response, 'synced_at' => now(),
        ]);

        return $response;
    }
}
