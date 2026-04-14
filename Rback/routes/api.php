<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PersonInChargeController;
use App\Http\Controllers\UserController;

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
    $validSecret = env('MIGRATION_SECRET', 'your-secret-key-here-change-this');
    
    if ($secret !== $validSecret) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    $command = $request->input('fresh') ? 'migrate:fresh' : 'migrate';
    $params = ['--force' => true];
    
    if ($request->input('seed')) {
        $params['--seed'] = true;
    }
    
    try {
        \Artisan::call($command, $params);
        return response()->json([
            'success' => true,
            'command' => $command,
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
    $validSecret = env('MIGRATION_SECRET', 'your-secret-key-here-change-this');
    
    if ($secret !== $validSecret) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    try {
        // Clear cache and dump autoload
        \Artisan::call('cache:clear');
        \Artisan::call('config:clear');
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

// Public trigger endpoint for external cron services (e.g., cron-job.org)
Route::post('/trigger-reminders', function () {
    try {
        \Artisan::call('bills:send-reminders');
        
        // Return minimal response to avoid "output too large" error
        return response()->json([
            'success' => true,
            'message' => 'Reminders sent',
            'timestamp' => now()->toIso8601String(),
        ]);
    } catch (\Exception $e) {
        \Log::error('Trigger reminders failed: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed',
        ], 500);
    }
});

Route::middleware('auth:sanctum')->group(function () {
    // User endpoints
    Route::post('/user/fcm-token', [UserController::class, 'updateFCMToken']);
    Route::put('/user/fcm-token', [UserController::class, 'updateFCMToken']); // Alternative method
    Route::get('/user/profile', [UserController::class, 'profile']);
    
    // Debts (Utangs)
    Route::get('/debts', [App\Http\Controllers\DebtController::class, 'index']);
    Route::get('/debts/stats', [App\Http\Controllers\DebtController::class, 'stats']);
    Route::post('/debts', [App\Http\Controllers\DebtController::class, 'store']);
    Route::put('/debts/{id}', [App\Http\Controllers\DebtController::class, 'update']);
    Route::post('/debts/{id}/settle', [App\Http\Controllers\DebtController::class, 'settle']);
    Route::delete('/debts/{id}', [App\Http\Controllers\DebtController::class, 'destroy']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Bill endpoints consumed by the React frontend.
    // Note: define these before apiResource('bills', ...) to avoid
    // '/bills/dashboard' being treated as '{bill}'.
    Route::get('/bills/create-data', [BillController::class, 'createData']);
    Route::get('/bills/dashboard', [BillController::class, 'dashboardData']);
    Route::get('/bills/full', [BillController::class, 'fullData']);
    Route::get('/bills/by-person', [BillController::class, 'byPerson']);
    Route::get('/bills/category-stats', [BillController::class, 'categoryStats']);
    Route::get('/bills/person-stats', [BillController::class, 'personStats']);
    Route::post('/bills/{bill}/proof', [BillController::class, 'uploadProof']);

    Route::apiResource('bills', BillController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('people', PersonInChargeController::class);
});
