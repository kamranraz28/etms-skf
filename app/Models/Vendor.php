<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vendor extends Model
{
    use HasFactory;

    protected $table = 'vendors';
    protected $fillable = ['user_id', 'name', 'email', 'phone', 'erp_code', 'status', 'notes'];
    protected $casts = [];

    public function user() { return $this->belongsTo(User::class); }
    public function bids() { return $this->hasMany(Bid::class); }
    public function categories() { return $this->belongsToMany(VendorCategory::class, 'category_vendor'); }
    public function claims() { return $this->hasMany(Claim::class); }
    public function tenders() { return $this->belongsToMany(Tender::class, 'tender_vendors'); }

}
