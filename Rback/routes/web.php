
// Serve the built React app (SPA) from `public/index.html`.
// This ensures routes like `/add-bill` work after refresh in production.
Route::fallback(function () {
    // Don't handle API routes - let them return 404
    $request = request();
    $path = $request->getPathInfo();
    
    // If it's an API request, let it return 404 (API routes are handled separately)
    if (str_starts_with($path, '/api')) {
        abort(404);
    }
    
    $requestedPath = ltrim($path, '/');
    
    // If the requested path is an actual file (css/js/images), return it.
    $fullPath = public_path($requestedPath);
    if ($requestedPath && File::exists($fullPath) && !File::isDirectory($fullPath)) {
        return response()->file($fullPath);
    }

    // Otherwise, fall back to SPA entrypoint.
    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }

    abort(404);
});
