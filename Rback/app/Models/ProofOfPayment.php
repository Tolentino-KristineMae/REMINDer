<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProofOfPayment extends Model
{
    protected $fillable = ['bill_id', 'file_path', 'details', 'voice_record_path'];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }
}
