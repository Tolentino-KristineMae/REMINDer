<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PersonInChargeController;

// So GET /api is handled by the API stack (not the SPA web fallback).
Route::get('/', function () {
    return response()->json([
        'message' => 'REMINDer API',
        'health' => '/api/status',
    ]);
});

Route::get('/status', function () {
    return response()->json(['status' => 'ok']);
});

// Hidden route to run migrations - requires MIGRATION_SECRET env var
Route::post('/migrate', function (Request $request) {
    $secret = $request->header('X-Migration-Secret');
    $validSecret = env('MIGRATION_SECRET', 'secret123');
    
    if ($secret !== $validSecret) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        \Artisan::call('migrate', ['--force' => true]);
        return response()->json([
            'success' => true,
            'output' => \Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Hidden route to seed database
Route::post('/seed', function (Request $request) {
    $secret = $request->header('X-Migration-Secret');
    $validSecret = env('MIGRATION_SECRET', 'secret123');
    
    if ($secret !== $validSecret) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        \Artisan::call('db:seed', ['--force' => true]);
        return response()->json([
            'success' => true,
            'output' => \Artisan::output()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Public diagnostics for Render + Vercel + Supabase (Postgres) — no auth.
Route::get('/health', function () {
    $database = [
        'connected' => false,
        'driver' => config('database.default'),
        'error' => null,
    ];

    try {
        DB::connection()->getPdo();
        $database['connected'] = true;
        $database['driver'] = DB::connection()->getDriverName();
    } catch (\Throwable $e) {
        $database['error'] = config('app.debug') ? $e->getMessage() : 'Database unreachable';
    }

    return response()->json([
        'ok' => $database['connected'],
        'app' => config('app.name'),
        'environment' => config('app.env'),
        'checks' => [
            'api' => true,
            'database' => $database,
        ],
        'time' => now()->toIso8601String(),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/create-user', [AuthController::class, 'createUser']); // Setup endpoint
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Bill endpoints consumed by the React frontend.
    // Note: define these before apiResource('bills', ...) to avoid
    // '/bills/dashboard' being treated as '{bill}'.
    Route::get('/bills/create-data', [BillController::class, 'createData']);
    Route::get('/bills/dashboard', [BillController::class, 'dashboardData']);
    Route::get('/bills/full', [BillController::class, 'fullData']);
    Route::post('/bills/{bill}/proof', [BillController::class, 'uploadProof']);

    Route::apiResource('bills', BillController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('people', PersonInChargeController::class);
});
