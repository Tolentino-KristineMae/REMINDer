<?php

$origins = trim((string) env('CORS_ALLOWED_ORIGINS', '*'));
if ($origins === '') {
    $origins = '*';
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $origins === '*' ? ['*'] : array_values(array_filter(array_map('trim', explode(',', $origins)))),
    // Preview deploys: https://*.vercel.app (optional; set CORS_ALLOWED_ORIGINS instead for stricter control)
    'allowed_origins_patterns' => filter_var(env('CORS_ALLOW_VERCEL_PREVIEWS', false), FILTER_VALIDATE_BOOLEAN)
        ? ['#^https://[^/]+\.vercel\.app$#i']
        : [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
