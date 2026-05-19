<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenderItemCategory extends Model
{
    protected $table = 'tender_item_categories';

    protected $fillable = [
        'tender_id',
        'item_index',
        'vendor_category_id',
    ];

    public function tender()
    {
        return $this->belongsTo(Tender::class);
    }

    public function vendorCategory()
    {
        return $this->belongsTo(VendorCategory::class);
    }
}
