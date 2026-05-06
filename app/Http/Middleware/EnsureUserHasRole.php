<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (! $user) abort(403);
        $userRoles = $user->roles()->pluck('role')->all();
        foreach ($roles as $r) {
            if (in_array($r, $userRoles, true)) return $next($request);
        }
        abort(403, 'Insufficient role.');
    }
}
