<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tender extends Model
{
    use HasFactory;

    protected $table = 'tenders';
    protected $fillable = ['tender_number', 'pr_id', 'title', 'description', 'deadline', 'status', 'created_by'];
    protected $casts = ['deadline' => 'datetime'];

    public function pr() { return $this->belongsTo(Pr::class); }
    public function vendors() { return $this->belongsToMany(Vendor::class, 'tender_vendors'); }
    public function bids() { return $this->hasMany(Bid::class); }
    public function cs() { return $this->hasOne(Cs::class); }
    public function itemCategories() { return $this->hasMany(TenderItemCategory::class); }

    public function itemCategoryIds(): array
    {
        $map = [];
        foreach ($this->itemCategories as $ic) {
            $map[$ic->item_index][] = $ic->vendor_category_id;
        }
        return $map;
    }

}
