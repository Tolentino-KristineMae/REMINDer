<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\ProofOfPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BillController extends Controller
{
    public function index()
    {
        return Bill::with(['category', 'personInCharge', 'proofOfPayments'])->get();
    }

    public function show(Bill $bill)
    {
        return $bill->load(['category', 'personInCharge', 'proofOfPayments']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'due_date' => 'required|date',
            'details' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'person_in_charge_id' => 'required|exists:person_in_charges,id',
        ]);

        $bill = Bill::create([
            'amount' => $request->amount,
            'due_date' => $request->due_date,
            'details' => $request->details,
            'category_id' => $request->category_id,
            'person_in_charge_id' => $request->person_in_charge_id,
            'status' => 'pending'
        ]);

        return response()->json($bill->load(['category', 'personInCharge']));
    }

    public function update(Request $request, Bill $bill)
    {
        $request->validate([
            'status' => 'required|in:pending,paid'
        ]);

        $bill->update($request->only('status'));

        return response()->json($bill->load(['category', 'personInCharge', 'proofOfPayments']));
    }

    public function uploadProof(Request $request, Bill $bill)
    {
        $request->validate([
            'proof' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'details' => 'nullable|string',
            'voice_record' => 'nullable|mimes:mp3,wav,m4a,ogg,webm|max:5120',
        ]);

        $proofPath = null;
        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('proofs', 'public');
        }

        $voicePath = null;
        if ($request->hasFile('voice_record')) {
            $voicePath = $request->file('voice_record')->store('voice_records', 'public');
        }

        ProofOfPayment::create([
            'bill_id' => $bill->id,
            'file_path' => $proofPath,
            'details' => $request->details,
            'voice_record_path' => $voicePath,
        ]);

        $bill->update(['status' => 'paid']);

        return response()->json([
            'message' => 'Proof uploaded successfully',
            'bill' => $bill->load(['category', 'personInCharge', 'proofOfPayments'])
        ]);
    }

    public function destroy(Bill $bill)
    {
        $bill->load('proofOfPayments');

        $pathsToDelete = [];
        foreach ($bill->proofOfPayments as $proof) {
            if ($proof->file_path) {
                $pathsToDelete[] = $proof->file_path;
            }
            if ($proof->voice_record_path) {
                $pathsToDelete[] = $proof->voice_record_path;
            }
        }

        if (!empty($pathsToDelete)) {
            Storage::disk('public')->delete($pathsToDelete);
        }

        $bill->delete();

        return response()->json(['message' => 'Bill deleted successfully']);
    }

    public function createData()
    {
        return response()->json([
            'categories' => \App\Models\Category::all(),
            'people' => \App\Models\PersonInCharge::all(),
        ]);
    }

    public function dashboardData()
    {
        $today = now()->toDateString();

        $stats = Bill::selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
            ->selectRaw("SUM(CASE WHEN status = 'pending' AND due_date < ? THEN 1 ELSE 0 END) as overdue", [$today])
            ->selectRaw('SUM(amount) as total_amount')
            ->selectRaw("SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid_amount")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_unpaid_amount")
            ->first();

        return response()->json([
            'stats' => [
                'total' => (int) $stats->total,
                'paid' => (int) $stats->paid,
                'pending' => (int) $stats->pending,
                'overdue' => (int) $stats->overdue,
                'total_amount' => (float) $stats->total_amount,
                'total_paid_amount' => (float) $stats->total_paid_amount,
                'total_unpaid_amount' => (float) $stats->total_unpaid_amount,
            ],
        ]);
    }

    public function stats()
    {
        $today = now()->toDateString();

        $stats = Bill::selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
            ->selectRaw("SUM(CASE WHEN status = 'pending' AND due_date < ? THEN 1 ELSE 0 END) as overdue", [$today])
            ->selectRaw('SUM(amount) as total_amount')
            ->selectRaw("SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid_amount")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_unpaid_amount")
            ->first();

        return response()->json([
            'total' => (int) $stats->total,
            'paid' => (int) $stats->paid,
            'pending' => (int) $stats->pending,
            'overdue' => (int) $stats->overdue,
            'total_amount' => (float) $stats->total_amount,
            'total_paid_amount' => (float) $stats->total_paid_amount,
            'total_unpaid_amount' => (float) $stats->total_unpaid_amount,
        ]);
    }
}
