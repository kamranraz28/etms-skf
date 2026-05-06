<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ErpSync extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'erp_sync';
    protected $fillable = ['cs_id', 'status', 'request_payload', 'response_data', 'synced_at'];
    protected $casts = ['request_payload' => 'array', 'response_data' => 'array', 'synced_at' => 'datetime'];


}
