<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Po extends Model
{
    protected $table = 'pos';
    protected $fillable = ['po_number', 'vendor_erp_code', 'items', 'po_date', 'status'];
    protected $casts = ['items' => 'array', 'po_date' => 'date'];
}
