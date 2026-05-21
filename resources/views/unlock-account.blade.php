<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Account Unlock — ETMS</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f1f5f9; color: #1e293b; }
.card { background: #fff; border-radius: 12px; padding: 40px; max-width: 420px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
.icon { font-size: 48px; margin-bottom: 16px; }
h1 { font-size: 20px; margin: 0 0 8px; }
p { color: #64748b; margin: 0 0 24px; font-size: 14px; line-height: 1.5; }
.btn { display: inline-block; background: #1e3a5f; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; }
.btn:hover { background: #152d4a; }
</style></head>
<body>
<div class="card">
  @if ($status === 'unlocked')
    <div class="icon">&#9989;</div>
    <h1>Account Unlocked</h1>
    <p>The account for <strong>{{ $email }}</strong> has been successfully unlocked. The user can now sign in again.</p>
    <a href="{{ url('/auth') }}" class="btn">Go to Sign In</a>
  @elseif ($status === 'not-found')
    <div class="icon">&#10060;</div>
    <h1>Account Not Found</h1>
    <p>No account exists with the email address provided. The link may be invalid or the account may have been removed.</p>
  @else
    <div class="icon">&#10060;</div>
    <h1>Invalid Link</h1>
    <p>This unlock link is invalid or has expired.</p>
  @endif
</div>
</body>
</html>
