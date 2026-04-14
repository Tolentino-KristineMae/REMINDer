<?php

namespace App\Console\Commands;

use App\Models\Bill;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendBillReminders extends Command
{
    protected $signature = 'bills:send-reminders';
    protected $description = 'Send push notifications for upcoming and overdue bills';

    public function handle()
    {
        $this->info('Checking for bills that need reminders...');
        
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();
        
        // Get bills that are due today, tomorrow, or overdue
        $bills = Bill::with(['personInCharge'])
            ->where('status', 'pending')
            ->where(function($query) use ($today, $tomorrow) {
                $query->where('due_date', '=', $today)
                      ->orWhere('due_date', '=', $tomorrow)
                      ->orWhere('due_date', '<', $today);
            })
            ->get();
        
        if ($bills->isEmpty()) {
            $this->info('No bills need reminders at this time.');
            return 0;
        }
        
        $this->info("Found {$bills->count()} bills that need reminders.");
        
        // Group bills by user (assuming bills belong to users)
        // For now, we'll send to all users with FCM tokens
        $users = User::whereNotNull('fcm_token')->get();
        
        if ($users->isEmpty()) {
            $this->warn('No users with FCM tokens found.');
            return 0;
        }
        
        $sentCount = 0;
        $failedCount = 0;
        
        foreach ($users as $user) {
            // Get bills relevant to this user
            // For now, sending all pending bills to all users
            // You can customize this logic based on your requirements
            
            $userBills = $bills;
            
            if ($userBills->isEmpty()) {
                continue;
            }
            
            // Categorize bills
            $dueToday = $userBills->filter(fn($b) => $b->due_date === $today);
            $dueTomorrow = $userBills->filter(fn($b) => $b->due_date === $tomorrow);
            $overdue = $userBills->filter(fn($b) => $b->due_date < $today);
            
            // Prepare notification message
            $title = '💰 Bill Reminder';
            $body = $this->buildNotificationBody($dueToday->count(), $dueTomorrow->count(), $overdue->count());
            
            // Send FCM notification
            if ($this->sendFCMNotification($user->fcm_token, $title, $body)) {
                $sentCount++;
                $this->info("✓ Sent notification to {$user->email}");
            } else {
                $failedCount++;
                $this->error("✗ Failed to send notification to {$user->email}");
            }
        }
        
        $this->info("\nSummary:");
        $this->info("- Notifications sent: {$sentCount}");
        $this->info("- Failed: {$failedCount}");
        
        return 0;
    }
    
    private function buildNotificationBody($todayCount, $tomorrowCount, $overdueCount)
    {
        $messages = [];
        
        if ($overdueCount > 0) {
            $messages[] = "{$overdueCount} bill(s) OVERDUE";
        }
        
        if ($todayCount > 0) {
            $messages[] = "{$todayCount} bill(s) due TODAY";
        }
        
        if ($tomorrowCount > 0) {
            $messages[] = "{$tomorrowCount} bill(s) due TOMORROW";
        }
        
        return implode(' • ', $messages);
    }
    
    private function sendFCMNotification($fcmToken, $title, $body)
    {
        $serverKey = env('FCM_SERVER_KEY');
        
        if (!$serverKey) {
            Log::error('FCM_SERVER_KEY not configured in .env');
            return false;
        }
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $serverKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $fcmToken,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                    'badge' => '1',
                ],
                'data' => [
                    'type' => 'bill_reminder',
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                ],
                'priority' => 'high',
            ]);
            
            if ($response->successful()) {
                Log::info("FCM notification sent successfully", [
                    'token' => substr($fcmToken, 0, 20) . '...',
                    'title' => $title,
                ]);
                return true;
            } else {
                Log::error("FCM notification failed", [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error("FCM notification exception: " . $e->getMessage());
            return false;
        }
    }
}
