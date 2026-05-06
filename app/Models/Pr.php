<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pr extends Model
{
    use HasFactory;

    protected $table = 'prs';
    protected $fillable = ['pr_number', 'title', 'department', 'requested_by', 'items', 'status', 'created_by'];
    protected $casts = ['items' => 'array'];

    public function tenders() { return $this->hasMany(Tender::class); }

}
