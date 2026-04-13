<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class DebtController extends Controller
{
    public function index(Request $request)
    {
        $query = Debt::with('personInCharge')->orderBy('created_at', 'desc');
        
        // Filter by type if requested
        if ($request->has('type')) {
            if ($request->type === 'mine') {
                $query->where('is_my_debt', true);
            } elseif ($request->type === 'owed') {
                $query->where('is_my_debt', false);
            }
        }
        
        // Filter by person if requested
        if ($request->has('person_id') && $request->person_id !== 'all') {
            $query->where('person_in_charge_id', $request->person_id);
        }
        
        // Filter by status if requested
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $debts = $query->get();
        
        return response()->json([
            'success' => true,
            'debts' => $debts
        ]);
    }
    
    public function stats(Request $request)
    {
        $query = Debt::query();
        
        // Filter by type if requested
        if ($request->has('type')) {
            if ($request->type === 'mine') {
                $query->where('is_my_debt', true);
            } elseif ($request->type === 'owed') {
                $query->where('is_my_debt', false);
            }
        }
        
        // Filter by person if requested
        if ($request->has('person_id') && $request->person_id !== 'all') {
            $query->where('person_in_charge_id', $request->person_id);
        }
        
        // Calculate stats
        $pending = (clone $query)->where('status', 'pending')->get();
        $paid = (clone $query)->where('status', 'paid')->get();
        
        $pendingTotal = $pending->sum('amount');
        $paidTotal = $paid->sum('amount');
        
        // Get people with debts (only for owed debts)
        $peopleWithDebts = [];
        if (!$request->has('type') || $request->type === 'owed') {
            $peopleWithDebts = Debt::where('is_my_debt', false)
                ->where('status', 'pending')
                ->with('personInCharge')
                ->get()
                ->groupBy('person_in_charge_id')
                ->map(function ($debts, $personId) {
                    $person = $debts->first()->personInCharge;
                    return [
                        'id' => $person->id,
                        'first_name' => $person->first_name,
                        'last_name' => $person->last_name,
                        'color' => $person->color,
                        'count' => $debts->count()
                    ];
                })
                ->values();
        }
        
        return response()->json([
            'success' => true,
            'stats' => [
                'pending_count' => $pending->count(),
                'pending_total' => $pendingTotal,
                'paid_count' => $paid->count(),
                'paid_total' => $paidTotal,
            ],
            'people_with_debts' => $peopleWithDebts
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string',
            'is_my_debt' => 'boolean',
            'person_in_charge_id' => 'nullable|exists:person_in_charges,id',
        ]);

        $debt = Debt::create([
            'amount' => $request->amount,
            'description' => $request->description,
            'is_my_debt' => $request->is_my_debt ?? true,
            'person_in_charge_id' => $request->person_in_charge_id,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'debt' => $debt->load('personInCharge')
        ], 201);
    }

    public function settle(Request $request, $id)
    {
        $debt = Debt::findOrFail($id);
        
        $request->validate([
            'proof_image' => 'nullable|image|max:10240',
            'proof_voice' => 'nullable|file|max:10240',
            'payment_details' => 'nullable|string',
        ]);

        try {
            $disk = env('AWS_BUCKET') ? 's3' : 'public';
            
            // Image Upload
            if ($request->hasFile('proof_image')) {
                $file = $request->file('proof_image');
                $filename = 'debt_proof_' . time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('debts', $filename, $disk);
                
                if ($disk === 's3') {
                    $endpoint = env('AWS_ENDPOINT');
                    $projectRef = explode('.', parse_url($endpoint, PHP_URL_HOST))[0];
                    $bucket = env('AWS_BUCKET');
                    $debt->proof_image_path = "https://{$projectRef}.supabase.co/storage/v1/object/public/{$bucket}/{$path}";
                } else {
                    $debt->proof_image_path = Storage::disk($disk)->url($path);
                }
            }

            // Voice Upload
            if ($request->hasFile('proof_voice')) {
                $file = $request->file('proof_voice');
                $filename = 'debt_voice_' . time() . '.webm';
                $path = $file->storeAs('debts', $filename, $disk);
                
                if ($disk === 's3') {
                    $endpoint = env('AWS_ENDPOINT');
                    $projectRef = explode('.', parse_url($endpoint, PHP_URL_HOST))[0];
                    $bucket = env('AWS_BUCKET');
                    $debt->proof_voice_path = "https://{$projectRef}.supabase.co/storage/v1/object/public/{$bucket}/{$path}";
                } else {
                    $debt->proof_voice_path = Storage::disk($disk)->url($path);
                }
            }

            $debt->status = 'paid';
            $debt->payment_details = $request->payment_details;
            $debt->paid_at = now();
            $debt->save();

            return response()->json([
                'success' => true,
                'debt' => $debt
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $debt = Debt::findOrFail($id);
        $debt->delete();
        return response()->json(['success' => true]);
    }

    public function update(Request $request, $id)
    {
        $debt = Debt::findOrFail($id);

        $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string',
            'is_my_debt' => 'sometimes|boolean',
            'person_in_charge_id' => 'nullable|exists:person_in_charges,id',
        ]);

        $debt->update([
            'amount' => $request->amount ?? $debt->amount,
            'description' => $request->description ?? $debt->description,
            'is_my_debt' => $request->is_my_debt ?? $debt->is_my_debt,
            'person_in_charge_id' => $request->person_in_charge_id ?? $debt->person_in_charge_id,
        ]);

        return response()->json([
            'success' => true,
            'debt' => $debt->load('personInCharge')
        ]);
    }
}
