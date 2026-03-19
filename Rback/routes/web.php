<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

// Serve the built React app (SPA) from `public/index.html`.
// This ensures routes like `/add-bill` work after refresh in production.
Route::get('/{any}', function (Request $request, $any) {
    $requestedPath = $any;

    // If the requested path is an actual file (css/js/images), return it.
    $fullPath = public_path($requestedPath);
    if (File::exists($fullPath) && !File::isDirectory($fullPath)) {
        return response()->file($fullPath);
    }

    // Otherwise, fall back to SPA entrypoint.
    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }

    abort(404);
})->where('any', '^(?!api\/).*$');


