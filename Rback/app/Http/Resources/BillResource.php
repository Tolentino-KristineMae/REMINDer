<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'due_date' => $this->due_date,
            'details' => $this->details,
            'category_id' => $this->category_id,
            'person_in_charge_id' => $this->person_in_charge_id,
            'status' => $this->status,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'person_in_charge' => new PersonInChargeResource($this->whenLoaded('personInCharge')),
            'proof_of_payments' => ProofOfPaymentResource::collection($this->whenLoaded('proofOfPayments')),
        ];
    }
}
