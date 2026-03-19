<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'icon'];

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }
}
