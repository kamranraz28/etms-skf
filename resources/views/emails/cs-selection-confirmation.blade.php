<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
.container { max-width: 560px; margin: 0 auto; padding: 24px; }
.header { background: #1e3a5f; color: #fff; padding: 24px; border-radius: 6px 6px 0 0; }
.header h1 { margin: 0; font-size: 18px; }
.body { background: #fff; border: 1px solid #e2e8f0; border-top: 0; padding: 24px; border-radius: 0 0 6px 6px; }
.footer { margin-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
.highlight { background: #eef2ff; border-left: 4px solid #1e3a5f; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 15px; font-weight: 700; color: #1e3a5f; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
th { background: #f8fafc; font-weight: 600; }
</style></head>
<body>
<div class="container">
<div class="header"><h1>Selection Confirmation</h1></div>
<div class="body">
<p>Dear <strong>{{ $vendor->name }}</strong>,</p>
<p>Congratulations! You have been selected for the following tender items.</p>

<div class="highlight">Eskayef Pharmaceuticals Limited</div>

<p><strong>Tender:</strong> {{ $cs->tender->title }} ({{ $cs->tender->tender_number }})</p>

<table>
<tr><th>#</th><th>Item</th><th>Unit Price</th><th>Qty</th></tr>
@foreach ($items as $idx => $sel)
<tr>
<td>{{ $idx + 1 }}</td>
<td>{{ $sel['item_index'] + 1 }}</td>
<td>{{ number_format((float)$sel['unit_price'], 2) }}</td>
<td>{{ (float)$sel['qty'] }}</td>
</tr>
@endforeach
</table>

<p>Please log in to the ETMS portal to review the full details.</p>
<p>Thank you for your participation.</p>
</div>
<div class="footer">&copy; {{ date('Y') }} ETMS — Eskayef Pharmaceuticals Limited. All rights reserved.</div>
</div>
</body>
</html>
