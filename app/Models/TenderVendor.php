<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenderVendor extends Model
{
    use HasFactory;

    protected $table = 'tender_vendors';

    protected $fillable = [
        'tender_id',
        'vendor_id'
    ];
}