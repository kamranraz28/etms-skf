<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pr extends Model
{
    use HasFactory;

    protected $table = 'prs';
    protected $fillable = ['pr_number', 'title', 'department', 'items', 'status', 'created_by'];
    protected $appends = ['derived_status'];
    protected $casts = ['items' => 'array'];

    public function tenders() { return $this->hasMany(Tender::class); }
    public function assignments() { return $this->hasMany(PrItemAssignment::class); }

    public function getDerivedStatusAttribute(): string
    {
        $items = $this->items ?? [];
        if (empty($items)) return $this->status;
        $assignments = $this->relationLoaded('assignments') ? $this->assignments : $this->assignments()->get();
        $assigned = $assignments->whereIn('status', ['in_tender', 'cs_assigned'])->count();
        if ($assigned === 0) return $this->status;
        if ($assigned < count($items)) return 'partial';
        return 'tendered';
    }
}
