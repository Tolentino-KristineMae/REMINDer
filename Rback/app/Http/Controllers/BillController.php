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
        \Illuminate\Support\Facades\Log::info('uploadProof called', [
            'bill_id' => $bill->id,
            'has_file' => $request->hasFile('proof'),
            'all_files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
        ]);

        $validated = $request->validate([
            'proof' => 'required|mimes:jpeg,png,gif,webp|max:5120',
            'details' => 'nullable|string',
            'paid_by' => 'nullable|string|max:255',
        ]);

        try {
            $proofPath = null;
            if ($request->hasFile('proof')) {
                $proofPath = $request->file('proof')->store('proofs', 'public');
            }

            $proofData = [
                'bill_id' => $bill->id,
                'file_path' => $proofPath,
            ];

            if ($request->has('details')) {
                $proofData['details'] = $request->details;
            }

            if ($request->has('paid_by')) {
                $proofData['paid_by'] = $request->paid_by;
            }

            ProofOfPayment::create($proofData);

            $bill->update(['status' => 'paid']);

            return response()->json([
                'message' => 'Proof uploaded successfully',
                'bill' => $bill->load(['category', 'personInCharge', 'proofOfPayments'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage(),
                'debug' => [
                    'file_received' => $request->hasFile('proof'),
                    'file_name' => $request->file('proof')?->getClientOriginalName(),
                    'file_size' => $request->file('proof')?->getSize(),
                ]
            ], 500);
        }
    }

    public function destroy(Bill $bill)
    {
        $bill->load('proofOfPayments');

        $pathsToDelete = [];
        foreach ($bill->proofOfPayments as $proof) {
            if ($proof->file_path) {
                $pathsToDelete[] = $proof->file_path;
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

        // Calendar / Paid Bills / Team pages expect:
        // - response.data.people
        // - response.data.bills (array)
        // Each bill should also include keys the frontend uses:
        // - person_in_charge (instead of personInCharge)
        // - proof_of_payments (instead of proofOfPayments)
        $people = \App\Models\PersonInCharge::query()->get();

        $bills = Bill::with(['category', 'personInCharge', 'proofOfPayments'])->get();

        $billsPayload = $bills->map(function (Bill $bill) {
            return [
                // Base columns used by the frontend
                'id' => $bill->id,
                'amount' => $bill->amount,
                'due_date' => $bill->due_date,
                'details' => $bill->details,
                'category_id' => $bill->category_id,
                'person_in_charge_id' => $bill->person_in_charge_id,
                'status' => $bill->status,

                // Relations with frontend-expected snake_case keys
                'category' => $bill->category,
                'person_in_charge' => $bill->personInCharge,
                'proof_of_payments' => $bill->proofOfPayments,
            ];
        })->values();

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
            'people' => $people,
            'bills' => $billsPayload,
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
