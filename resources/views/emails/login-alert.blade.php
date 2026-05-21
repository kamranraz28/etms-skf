<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
.container { max-width: 560px; margin: 0 auto; padding: 24px; }
.header { background: #b91c1c; color: #fff; padding: 24px; border-radius: 6px 6px 0 0; }
.header h1 { margin: 0; font-size: 18px; }
.body { background: #fff; border: 1px solid #e2e8f0; border-top: 0; padding: 24px; border-radius: 0 0 6px 6px; }
.footer { margin-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
th { background: #f8fafc; font-weight: 600; }
.btn { display: inline-block; background: #1e3a5f; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 8px 0; }
.btn:hover { background: #152d4a; }
</style></head>
<body>
<div class="container">
<div class="header"><h1>&#9888; Account Locked — Suspicious Activity</h1></div>
<div class="body">
<p>This is an automated security alert.</p>

<p>The following account has been <strong>locked for 1 hour</strong> due to 5 consecutive failed login attempts:</p>

<table>
<tr><th>User</th><td>{{ $user->full_name }}</td></tr>
<tr><th>Email</th><td>{{ $user->email }}</td></tr>
<tr><th>IP Address</th><td>{{ $ip }}</td></tr>
<tr><th>Locked until</th><td>{{ $user->locked_until ? $user->locked_until->format('Y-m-d H:i:s T') : '—' }}</td></tr>
</table>

<p style="margin-top: 24px;">
  <a href="{{ URL::signedRoute('auth.unlock', ['email' => $user->email]) }}" class="btn">&#128274; Unlock Account Now</a>
</p>
<p style="font-size: 13px; color: #64748b;">This link is signed and valid for immediate use. Clicking it will immediately re-activate the account without waiting for the lockout period to expire.</p>

<p style="margin-top: 20px;">If this was not authorised activity, please investigate immediately.</p>
<p>If the legitimate user is locked out, an administrator can also clear the <code>login_attempts</code> and <code>locked_until</code> fields in the database manually.</p>
</div>
<div class="footer">&copy; {{ date('Y') }} ETMS. All rights reserved.</div>
</div>
</body>
</html>
