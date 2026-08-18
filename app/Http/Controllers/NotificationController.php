<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markRead(Request $r, $id)
    {
        $notification = $r->user()->notifications()->where('id', $id)->first();
        if (! $notification) {
            return back()->with('error', 'Notification not found.');
        }
        $notification->markAsRead();
        $url = $notification->data['url'] ?? null;
        return $url ? redirect($url) : back();
    }

    public function markAllRead(Request $r)
    {
        $r->user()->unreadNotifications->each->markAsRead();
        return back();
    }
}