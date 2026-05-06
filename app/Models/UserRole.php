<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserRole extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_roles';
    protected $fillable = ['user_id', 'role'];
    protected $casts = [];

    public function user() { return $this->belongsTo(User::class); }

}
