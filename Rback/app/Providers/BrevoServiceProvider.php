<?php

namespace App\Providers;

use App\Services\BrevoService;
use Illuminate\Support\ServiceProvider;

class BrevoServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(BrevoService::class, function ($app) {
            return new BrevoService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}