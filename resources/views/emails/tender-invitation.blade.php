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
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
th { background: #f8fafc; font-weight: 600; }
</style></head>
<body>
<div class="container">
<div class="header"><h1>Tender Invitation</h1></div>
<div class="body">
<p>Dear <strong>{{ $vendor->name }}</strong>,</p>
<p>You are invited to participate in the following tender.</p>

<div class="highlight">Eskayef Pharmaceuticals Limited</div>

<table>
<tr><th>Tender #</th><td>{{ $tender->tender_number }}</td></tr>
<tr><th>Title</th><td>{{ $tender->title }}</td></tr>
<tr><th>Description</th><td>{{ $tender->description ?? '—' }}</td></tr>
<tr><th>Deadline</th><td>{{ \Carbon\Carbon::parse($tender->deadline)->format('d M Y, h:i A') }}</td></tr>
</table>

<p>Please log in to the ETMS portal to view the full tender details and submit your bid before the deadline.</p>
<p>If you have any questions, please contact the procurement team.</p>
</div>
<div class="footer">&copy; {{ date('Y') }} ETMS — Eskayef Pharmaceuticals Limited. All rights reserved.</div>
</div>
</body>
</html>
