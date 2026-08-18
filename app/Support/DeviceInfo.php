<?php

namespace App\Support;

use Illuminate\Http\Request;

class DeviceInfo
{
    public static function capture(Request $request): array
    {
        $ip = $request->ip();

        $hostname = null;
        if ($ip) {
            $resolved = @gethostbyaddr($ip);
            if ($resolved && strtolower($resolved) !== strtolower($ip) && filter_var($resolved, FILTER_VALIDATE_IP) === false) {
                $hostname = $resolved;
            }
        }

        return [
            'device_ip' => $ip,
            'device_name' => $hostname,
        ];
    }
}
