<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['email', 'full_name', 'password'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['email_verified_at' => 'datetime', 'password' => 'hashed'];

    public function roles() { return $this->hasMany(UserRole::class); }
    public function vendor() { return $this->hasOne(Vendor::class); }

    public function primaryRole(): ?string
    {
        $priority = ['admin', 'procurement', 'approver', 'vendor'];
        $mine = $this->roles()->pluck('role')->all();
        foreach ($priority as $r) if (in_array($r, $mine, true)) return $r;
        return null;
    }

    public function hasRole(string $r): bool
    {
        return $this->roles()->where('role', $r)->exists();
    }
}
