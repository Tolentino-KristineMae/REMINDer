<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

class DebtController extends Controller
{
    public function index()
    {
        $debts = Debt::with('personInCharge')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'debts' => $debts
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
}
