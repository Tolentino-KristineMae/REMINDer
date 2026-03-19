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
        $totalBills = Bill::count();
        $paidBills = Bill::where('status', 'paid')->count();
        $pendingBills = Bill::where('status', 'pending')->count();
        $overdueBills = Bill::where('status', 'pending')
            ->where('due_date', '<', $today)
            ->count();
        $totalAmount = Bill::sum('amount');
        $totalPaidAmount = Bill::where('status', 'paid')->sum('amount');
        $totalUnpaidAmount = Bill::where('status', 'pending')->sum('amount');
        
        $bills = Bill::with(['category', 'personInCharge', 'proofOfPayments'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'stats' => [
                'total' => $totalBills,
                'paid' => $paidBills,
                'pending' => $pendingBills,
                'overdue' => $overdueBills,
                'total_amount' => $totalAmount,
                'total_paid_amount' => $totalPaidAmount,
                'total_unpaid_amount' => $totalUnpaidAmount,
            ],
            'bills' => $bills,
            'categories' => \App\Models\Category::all(),
            'people' => \App\Models\PersonInCharge::all(),
        ]);
    }

    public function stats()
    {
        $today = now()->toDateString();
        $totalBills = Bill::count();
        $paidBills = Bill::where('status', 'paid')->count();
        $pendingBills = Bill::where('status', 'pending')->count();
        $overdueBills = Bill::where('status', 'pending')
            ->where('due_date', '<', $today)
            ->count();
        $totalAmount = Bill::sum('amount');
        
        return response()->json([
            'total' => $totalBills,
            'paid' => $paidBills,
            'pending' => $pendingBills,
            'overdue' => $overdueBills,
            'total_amount' => $totalAmount,
        ]);
    }
}
