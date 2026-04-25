<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount',
        'title',
        'description',
        'is_my_debt',
        'person_in_charge_id',
        'status',
        'proof_image_path',
        'proof_voice_path',
        'payment_details',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_my_debt' => 'boolean',
        'paid_at' => 'datetime',
    ];

    public function personInCharge()
    {
        return $this->belongsTo(PersonInCharge::class, 'person_in_charge_id');
    }
}
