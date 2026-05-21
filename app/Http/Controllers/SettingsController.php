<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings', [
            'login_alert_enabled' => Setting::isEnabled('login_alert_enabled'),
            'login_alert_email' => Setting::get('login_alert_email'),
        ]);
    }

    public function update(Request $r)
    {
        $data = $r->validate([
            'login_alert_enabled' => 'required|boolean',
            'login_alert_email' => 'required|email',
        ]);

        Setting::set('login_alert_enabled', $data['login_alert_enabled'] ? 'true' : 'false');
        Setting::set('login_alert_email', $data['login_alert_email']);

        return back()->with('success', 'Settings saved.');
    }
}
