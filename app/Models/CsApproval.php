<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class CsApproval extends Model
{
    use HasFactory;

    protected $table = 'cs_approvals';
    protected $fillable = ['cs_id', 'step', 'decision', 'comment', 'acted_by', 'acted_at'];
    protected $casts = ['acted_at' => 'datetime'];


}
