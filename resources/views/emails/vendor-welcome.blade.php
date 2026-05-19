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
<div class="header"><h1>Welcome to ETMS</h1></div>
<div class="body">
<p>Dear <strong>{{ $vendor->name }}</strong>,</p>
<p>Your vendor account has been created on the Enterprise Tender Management System (ETMS).</p>

<div class="highlight">Eskayef Pharmaceuticals Limited</div>

<p>You can now participate in tenders and submit bids.</p>

<table>
<tr><th>ERP Code</th><td>{{ $vendor->erp_code ?? '—' }}</td></tr>
<tr><th>Email</th><td>{{ $vendor->email }}</td></tr>
<tr><th>Status</th><td>{{ ucfirst($vendor->status) }}</td></tr>
<tr><th>Login URL</th><td>{{ url('/auth') }}</td></tr>
<tr><th>Password</th><td>{{ $password }}</td></tr>
</table>

<p>Please sign in using your email and the password above. We recommend changing your password after first login.</p>
<p>If you have any questions, please contact the procurement team.</p>
</div>
<div class="footer">&copy; {{ date('Y') }} ETMS. All rights reserved.</div>
</div>
</body>
</html>
