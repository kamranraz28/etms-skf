<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vendor extends Model
{
    use HasFactory;

    protected $table = 'vendors';
    protected $fillable = ['user_id', 'vendor_category_id', 'name', 'email', 'phone', 'erp_code', 'status', 'notes'];
    protected $casts = [];

    public function user() { return $this->belongsTo(User::class); }
    public function bids() { return $this->hasMany(Bid::class); }
    public function vendorCategory() { return $this->belongsTo(VendorCategory::class); }
    public function claims() { return $this->hasMany(Claim::class); }

}
