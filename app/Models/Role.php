<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    protected $fillable = ['slug', 'label', 'is_system'];

    protected $casts = ['is_system' => 'boolean'];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    public function usersCount(): int
    {
        return UserRole::where('role', $this->slug)->count();
    }

    public function workflowUsageCount(): int
    {
        return WorkflowStep::where('role_name', $this->slug)->count();
    }
}
