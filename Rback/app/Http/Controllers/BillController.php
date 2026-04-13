<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\ProofOfPayment;
use App\Http\Resources\BillResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PersonInChargeResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BillController extends Controller
{
    public function index()
    {
        try {
            $bills = Bill::with(['category', 'personInCharge', 'proofOfPayments'])->get();
            return BillResource::collection($bills);
        } catch (\Exception $e) {
            \Log::error('BillController@index error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading bills: ' . $e->getMessage()], 500);
        }
    }

    public function show(Bill $bill)
    {
        try {
            return new BillResource($bill->load(['category', 'personInCharge', 'proofOfPayments']));
        } catch (\Exception $e) {
            \Log::error('BillController@show error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading bill: ' . $e->getMessage()], 500);
        }
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

        return new BillResource($bill->load(['category', 'personInCharge']));
    }

    public function update(Request $request, Bill $bill)
    {
        $request->validate([
            'amount' => 'sometimes|numeric',
            'due_date' => 'sometimes|date',
            'details' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'person_in_charge_id' => 'sometimes|exists:person_in_charges,id',
            'status' => 'sometimes|in:pending,paid'
        ]);

        $bill->update($request->only(['amount', 'due_date', 'details', 'category_id', 'person_in_charge_id', 'status']));

        return new BillResource($bill->load(['category', 'personInCharge', 'proofOfPayments']));
    }

    public function uploadProof(Request $request, Bill $bill)
    {
        \Illuminate\Support\Facades\Log::info('uploadProof called', [
            'bill_id' => $bill->id,
            'has_file' => $request->hasFile('proof'),
            'all_files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
        ]);

        $request->validate([
            'proof' => 'required|mimes:jpeg,png,gif,webp|max:10240',
            'details' => 'nullable|string',
            'paid_by' => 'nullable|string|max:255',
            'voice_note' => 'nullable|mimes:webm,mp3,wav,ogg|max:10240',
        ]);

        try {
            $proofUrl = null;
            $voiceUrl = null;
            // Use 's3' for Supabase storage if AWS_BUCKET is set, otherwise fallback to default/public
            $disk = env('AWS_BUCKET') ? 's3' : config('filesystems.default', 'public');
            
            if ($request->hasFile('proof')) {
                $file = $request->file('proof');
                $filename = time() . '_' . $file->getClientOriginalName();
                $proofPath = $file->storeAs('', $filename, $disk);

                if (!$proofPath) {
                    throw new \Exception('Failed to store file on disk: ' . $disk);
                }

                if ($disk === 's3') {
                    // If AWS_URL is set, use it, otherwise construct Supabase public URL
                    if (env('AWS_URL')) {
                        $proofUrl = rtrim(env('AWS_URL'), '/') . '/' . $proofPath;
                    } else {
                        $endpoint = env('AWS_ENDPOINT');
                        $projectRef = explode('.', parse_url($endpoint, PHP_URL_HOST))[0];
                        $bucket = env('AWS_BUCKET');
                        $proofUrl = "https://{$projectRef}.supabase.co/storage/v1/object/public/{$bucket}/{$proofPath}";
                    }
                } else {
                    $proofUrl = Storage::disk($disk)->url($proofPath);
                }
            } else {
                throw new \Exception('No file provided in the request');
            }

            // Handle Voice Note
            if ($request->hasFile('voice_note')) {
                $voiceFile = $request->file('voice_note');
                $voiceFilename = 'voice_' . time() . '.webm';
                $voicePath = $voiceFile->storeAs('', $voiceFilename, $disk);

                if ($voicePath) {
                    if ($disk === 's3') {
                        if (env('AWS_URL')) {
                            $voiceUrl = rtrim(env('AWS_URL'), '/') . '/' . $voicePath;
                        } else {
                            $endpoint = env('AWS_ENDPOINT');
                            $projectRef = explode('.', parse_url($endpoint, PHP_URL_HOST))[0];
                            $bucket = env('AWS_BUCKET');
                            $voiceUrl = "https://{$projectRef}.supabase.co/storage/v1/object/public/{$bucket}/{$voicePath}";
                        }
                    } else {
                        $voiceUrl = Storage::disk($disk)->url($voicePath);
                    }
                }
            }

            $proofData = [
                'bill_id' => $bill->id,
                'file_path' => $proofUrl,
                'voice_record_path' => $voiceUrl,
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
                'bill' => new BillResource($bill->load(['category', 'personInCharge', 'proofOfPayments']))
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

        // Try to delete files from storage, but continue even if it fails
        try {
            foreach ($bill->proofOfPayments as $proof) {
                if ($proof->file_path) {
                    // Extract the path from the full URL if needed
                    $path = $proof->file_path;
                    if (str_contains($path, 'supabase.co')) {
                        // For Supabase URLs, try to extract the path after 'proofs/'
                        if (preg_match('/\/proofs\/(.+)$/', $path, $matches)) {
                            $path = 'proofs/' . $matches[1];
                        }
                    }
                    try {
                        \Storage::disk('s3')->delete($path);
                    } catch (\Exception $e) {
                        // Supabase storage might have different driver, try public disk
                        try {
                            \Storage::disk('public')->delete($path);
                        } catch (\Exception $e2) {
                            // Ignore file deletion errors - continue with bill deletion
                            \Log::warning('Could not delete file: ' . $path . ' - ' . $e2->getMessage());
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Continue even if file deletion fails
            \Log::warning('File deletion error: ' . $e->getMessage());
        }

        $bill->delete();

        return response()->json(['message' => 'Bill deleted successfully']);
    }

    public function createData()
    {
        return response()->json([
            'categories' => CategoryResource::collection(\App\Models\Category::all()),
            'people' => PersonInChargeResource::collection(\App\Models\PersonInCharge::all()),
        ]);
    }

    public function dashboardData()
    {
        try {
            $today = now()->toDateString();
            $startOfMonth = now()->startOfMonth()->toDateString();
            $endOfMonth = now()->endOfMonth()->toDateString();

            // 1. Get Global Stats
            $stats = Bill::selectRaw('COUNT(*) as total')
                ->selectRaw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid")
                ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending")
                ->selectRaw("SUM(CASE WHEN status = 'pending' AND due_date < ? THEN 1 ELSE 0 END) as overdue", [$today])
                ->selectRaw('SUM(amount) as total_amount')
                ->selectRaw("SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid_amount")
                ->selectRaw("SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_unpaid_amount")
                ->first();

            // 2. Get Categories with unpaid bill counts
            $categories = \App\Models\Category::leftJoin('bills', function($join) {
                    $join->on('categories.id', '=', 'bills.category_id')
                        ->whereIn('bills.status', ['pending', 'overdue']);
                })
                ->select('categories.id', 'categories.name')
                ->selectRaw("COALESCE(categories.color, '#22c55e') as color")
                ->selectRaw('COUNT(bills.id) as count')
                ->groupBy('categories.id', 'categories.name', 'categories.color')
                ->havingRaw('COUNT(bills.id) > 0')
                ->get();

            return response()->json([
                'stats' => [
                    'total' => (int) ($stats->total ?? 0),
                    'paid' => (int) ($stats->paid ?? 0),
                    'pending' => (int) ($stats->pending ?? 0),
                    'overdue' => (int) ($stats->overdue ?? 0),
                    'total_amount' => (float) ($stats->total_amount ?? 0),
                    'total_paid_amount' => (float) ($stats->total_paid_amount ?? 0),
                    'total_unpaid_amount' => (float) ($stats->total_unpaid_amount ?? 0),
                ],
                'categories' => $categories->map(function($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'color' => $cat->color,
                        'count' => (int) $cat->count
                    ];
                })
            ]);
        } catch (\Exception $e) {
            \Log::error('BillController@dashboardData error: ' . $e->getMessage());
            $debug = config('app.debug') ? ['trace' => $e->getTraceAsString()] : [];
            return response()->json(array_merge(['message' => 'Error loading dashboard: ' . $e->getMessage()], $debug), 500);
        }
    }

    public function fullData()
    {
        try {
            // Optimize: Use parallel queries and limit data
            $people = \App\Models\PersonInCharge::select('id', 'first_name', 'last_name', 'color')->get();
            
            // Only load bills with necessary relations, limit to recent 500 for performance
            $bills = Bill::with(['category:id,name,color', 'personInCharge:id,first_name,last_name,color', 'proofOfPayments:id,bill_id,file_path,voice_record_path,details,paid_by,created_at'])
                ->orderBy('created_at', 'desc')
                ->limit(500)
                ->get();

            return response()->json([
                'people' => PersonInChargeResource::collection($people),
                'bills' => BillResource::collection($bills),
            ]);
        } catch (\Exception $e) {
            \Log::error('BillController@fullData error: ' . $e->getMessage());
            $debug = config('app.debug') ? ['trace' => $e->getTraceAsString()] : [];
            return response()->json(array_merge(['message' => 'Error loading bills: ' . $e->getMessage()], $debug), 500);
        }
    }
    
    public function byPerson(Request $request)
    {
        try {
            $query = Bill::with(['category', 'personInCharge', 'proofOfPayments']);
            
            // Filter by person if requested
            if ($request->has('person_id') && $request->person_id !== 'all') {
                $query->where('person_in_charge_id', $request->person_id);
            }
            
            // Filter by status if requested
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            $bills = $query->get();
            
            // Get people with pending bills
            $peopleWithPendingBills = Bill::where('status', 'pending')
                ->with('personInCharge')
                ->get()
                ->groupBy('person_in_charge_id')
                ->map(function ($bills, $personId) {
                    $person = $bills->first()->personInCharge;
                    return [
                        'id' => $person->id,
                        'first_name' => $person->first_name,
                        'last_name' => $person->last_name,
                        'color' => $person->color,
                        'count' => $bills->count()
                    ];
                })
                ->values();
            
            // Get people with settled bills
            $peopleWithSettledBills = Bill::where('status', 'paid')
                ->with('personInCharge')
                ->get()
                ->groupBy('person_in_charge_id')
                ->map(function ($bills, $personId) {
                    $person = $bills->first()->personInCharge;
                    return [
                        'id' => $person->id,
                        'first_name' => $person->first_name,
                        'last_name' => $person->last_name,
                        'color' => $person->color,
                        'count' => $bills->count()
                    ];
                })
                ->values();
            
            // Calculate totals
            $pendingBills = $bills->where('status', 'pending');
            $settledBills = $bills->where('status', 'paid');
            
            return response()->json([
                'bills' => BillResource::collection($bills),
                'people_with_pending' => $peopleWithPendingBills,
                'people_with_settled' => $peopleWithSettledBills,
                'stats' => [
                    'pending_total' => $pendingBills->sum('amount'),
                    'settled_total' => $settledBills->sum('amount'),
                    'pending_count' => $pendingBills->count(),
                    'settled_count' => $settledBills->count(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('BillController@byPerson error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading bills: ' . $e->getMessage()], 500);
        }
    }
    
    public function categoryStats()
    {
        try {
            $bills = Bill::with('category')->get();
            
            $stats = \App\Models\Category::leftJoin('bills', 'categories.id', '=', 'bills.category_id')
                ->select('categories.id', 'categories.name', 'categories.color')
                ->selectRaw('COUNT(bills.id) as total_count')
                ->selectRaw("SUM(CASE WHEN bills.status = 'paid' THEN 1 ELSE 0 END) as paid_count")
                ->selectRaw('SUM(bills.amount) as total_amount')
                ->groupBy('categories.id', 'categories.name', 'categories.color')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'color' => $category->color ?? '#22c55e',
                        'count' => (int) $category->total_count,
                        'paid_count' => (int) $category->paid_count,
                        'total_amount' => (float) $category->total_amount,
                        'performance_percentage' => $category->total_count > 0 
                            ? round(($category->paid_count / $category->total_count) * 100) 
                            : 0
                    ];
                });
            
            return response()->json([
                'success' => true,
                'categories' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('BillController@categoryStats error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading category stats: ' . $e->getMessage()], 500);
        }
    }
    
    public function personStats()
    {
        try {
            $stats = \App\Models\PersonInCharge::leftJoin('bills', 'person_in_charges.id', '=', 'bills.person_in_charge_id')
                ->select('person_in_charges.id', 'person_in_charges.first_name', 'person_in_charges.last_name', 'person_in_charges.color')
                ->selectRaw('COUNT(bills.id) as total_count')
                ->selectRaw("SUM(CASE WHEN bills.status = 'paid' THEN 1 ELSE 0 END) as paid_count")
                ->selectRaw('SUM(bills.amount) as total_amount')
                ->groupBy('person_in_charges.id', 'person_in_charges.first_name', 'person_in_charges.last_name', 'person_in_charges.color')
                ->get()
                ->map(function ($person) {
                    return [
                        'id' => $person->id,
                        'first_name' => $person->first_name,
                        'last_name' => $person->last_name,
                        'color' => $person->color,
                        'count' => (int) $person->total_count,
                        'paid_count' => (int) $person->paid_count,
                        'total_amount' => (float) $person->total_amount,
                        'performance_percentage' => $person->total_count > 0 
                            ? round(($person->paid_count / $person->total_count) * 100) 
                            : 0
                    ];
                });
            
            return response()->json([
                'success' => true,
                'people' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('BillController@personStats error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading person stats: ' . $e->getMessage()], 500);
        }
    }
}
