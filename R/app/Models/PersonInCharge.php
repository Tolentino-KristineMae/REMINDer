<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PersonInCharge extends Model
{
    protected $table = 'person_in_charges';
    protected $fillable = ['name', 'avatar'];

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }
}
