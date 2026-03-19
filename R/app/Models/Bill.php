<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    protected $fillable = [
        'amount',
        'due_date',
        'details',
        'category_id',
        'person_in_charge_id',
        'status'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function personInCharge(): BelongsTo
    {
        return $this->belongsTo(PersonInCharge::class, 'person_in_charge_id');
    }

    public function proofOfPayments(): HasMany
    {
        return $this->hasMany(ProofOfPayment::class);
    }
}
