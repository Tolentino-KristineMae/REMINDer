<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillController;

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
    Route::get('/bills/stats', [BillController::class, 'stats']);
    Route::post('/bills/{bill}/proof', [BillController::class, 'uploadProof']);

    Route::apiResource('bills', BillController::class);
});
