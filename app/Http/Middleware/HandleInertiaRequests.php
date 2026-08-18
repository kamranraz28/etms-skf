<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $notifications = null;
        $unreadCount = 0;
        if ($user) {
            $notifications = $user->notifications()
                ->orderByDesc('created_at')
                ->take(20)
                ->get()
                ->map(fn ($n) => [
                    'id' => $n->id,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                    'data' => $n->data,
                ])->values();
            $unreadCount = $user->unreadNotifications()->count();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'roles' => $user->roles()->pluck('role')->all(),
                    'primary_role' => $user->primaryRole(),
                ] : null,
            ],
            'notifications' => $notifications,
            'unread_notifications' => $unreadCount,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
