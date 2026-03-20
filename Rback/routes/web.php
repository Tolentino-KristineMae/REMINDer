<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

// Serve the built React app (SPA) from `public/index.html`.
// This ensures routes like `/add-bill` work after refresh in production.
Route::fallback(function () {
    $path = request()->getPathInfo();

    if (str_starts_with($path, '/api')) {
        abort(404);
    }

    $requestedPath = ltrim($path, '/');

    if ($requestedPath !== '') {
        $fullPath = public_path($requestedPath);
        if (File::exists($fullPath) && ! File::isDirectory($fullPath)) {
            return response()->file($fullPath);
        }
    }

    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }

    abort(404);
});
