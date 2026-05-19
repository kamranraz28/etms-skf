<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClaimDocument extends Model
{
    use HasFactory;

    protected $table = 'claim_documents';
    protected $fillable = ['claim_id', 'document_type', 'original_name', 'stored_path', 'mime_type', 'file_size'];

    public function claim()
    {
        return $this->belongsTo(Claim::class);
    }
}
