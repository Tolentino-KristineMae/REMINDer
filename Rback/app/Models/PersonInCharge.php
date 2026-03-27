<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PersonInCharge extends Model
{
    protected $table = 'person_in_charges';
    protected $fillable = ['first_name', 'last_name', 'email', 'phone', 'avatar', 'color'];

    public function getNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }
}
