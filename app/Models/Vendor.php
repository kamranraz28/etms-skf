<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Vendor extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'vendors';
    protected $fillable = ['user_id', 'name', 'email', 'phone', 'erp_code', 'status', 'notes'];
    protected $casts = [];

    public function user() { return $this->belongsTo(User::class); }
    public function bids() { return $this->hasMany(Bid::class); }

}
