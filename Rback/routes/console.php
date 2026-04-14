<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Schedule bill reminders to run daily at 9 AM
Schedule::command('bills:send-reminders')
    ->dailyAt('09:00')
    ->timezone('Asia/Manila');

// You can also add multiple times throughout the day
// Schedule::command('bills:send-reminders')->dailyAt('18:00')->timezone('Asia/Manila');
