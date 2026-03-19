<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillController;

Route::get('/status', function () {
    return response()->json(['status' => 'ok']);
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
