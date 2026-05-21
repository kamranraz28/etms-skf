<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Claim extends Model
{
    use HasFactory;

    protected $table = 'claims';
    protected $fillable = [
        'claim_number', 'vendor_id', 'po_number', 'title', 'description',
        'amount', 'status', 'submitted_at', 'approved_at', 'rejected_at',
        'rejection_reason', 'created_by',
    ];
    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function documents()
    {
        return $this->hasMany(ClaimDocument::class);
    }

    public function approvals()
    {
        return $this->hasMany(ClaimApproval::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
