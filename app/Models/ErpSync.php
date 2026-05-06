<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ErpSync extends Model
{
    use HasFactory;

    protected $table = 'erp_sync';
    protected $fillable = ['cs_id', 'status', 'request_payload', 'response_data', 'synced_at'];
    protected $casts = ['request_payload' => 'array', 'response_data' => 'array', 'synced_at' => 'datetime'];


}
