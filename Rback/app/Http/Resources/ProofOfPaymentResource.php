<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProofOfPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bill_id' => $this->bill_id,
            'file_path' => $this->file_path,
            'voice_record_path' => $this->voice_record_path,
            'details' => $this->details,
            'paid_by' => $this->paid_by,
            'created_at' => $this->created_at,
        ];
    }
}
