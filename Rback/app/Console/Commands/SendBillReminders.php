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
        $in3Days = now()->addDays(3)->toDateString();
        $in5Days = now()->addDays(5)->toDateString();
        $in7Days = now()->addDays(7)->toDateString();
        
        // Get bills that are due within 7 days, today, tomorrow, or overdue
        $bills = Bill::with(['personInCharge', 'category'])
            ->where('status', 'pending')
            ->where(function($query) use ($today, $tomorrow, $in3Days, $in5Days, $in7Days) {
                $query->where('due_date', '=', $today)
                      ->orWhere('due_date', '=', $tomorrow)
                      ->orWhere('due_date', '=', $in3Days)
                      ->orWhere('due_date', '=', $in5Days)
                      ->orWhere('due_date', '=', $in7Days)
                      ->orWhere('due_date', '<', $today); // Overdue
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
            $userBills = $bills;
            
            if ($userBills->isEmpty()) {
                continue;
            }
            
            // Send one notification per bill with specific details
            foreach ($userBills as $bill) {
                $title = $this->buildNotificationTitle($bill, $today, $tomorrow, $in3Days, $in5Days, $in7Days);
                $body = $this->buildBillNotificationBody($bill);
                
                if ($this->sendFCMNotification($user->fcm_token, $title, $body, $bill->id)) {
                    $sentCount++;
                    $this->info("✓ Sent notification for bill '{$bill->details}' to {$user->email}");
                } else {
                    $failedCount++;
                    $this->error("✗ Failed to send notification for bill '{$bill->details}' to {$user->email}");
                }
            }
        }
        
        $this->info("\nSummary:");
        $this->info("- Notifications sent: {$sentCount}");
        $this->info("- Failed: {$failedCount}");
        
        return 0;
    }
    
    private function buildNotificationTitle($bill, $today, $tomorrow, $in3Days, $in5Days, $in7Days)
    {
        $dueDate = $bill->due_date;

        if ($dueDate < $today) {
            return ' Overdue Bill';
        } elseif ($dueDate === $today) {
            return 'Bill Due Today';
        } elseif ($dueDate === $tomorrow) {
            return 'Bill Due Tomorrow';
        } elseif ($dueDate === $in3Days) {
            return 'Bill Due in 3 Days';
        } elseif ($dueDate === $in5Days) {
            return 'Bill Due in 5 Days';
        } elseif ($dueDate === $in7Days) {
            return 'Bill Due in 7 Days';
        }

        return 'Bill Reminder';
    }

    private function buildBillNotificationBody($bill)
    {
        $category = $bill->category->name ?? 'Uncategorized';
        $amount   = '₱' . number_format($bill->amount, 2);

        return "{$category} — {$amount}";
    }
    
    private function sendFCMNotification($fcmToken, $title, $body, $billId = null)
    {
        $projectId = env('FCM_PROJECT_ID');
        
        // Try to get credentials from environment variable first, then from file
        $credentials = null;
        
        if (env('FCM_CREDENTIALS_JSON')) {
            // Read from environment variable (for Render free tier)
            $credentials = json_decode(env('FCM_CREDENTIALS_JSON'), true);
        } else {
            // Read from file (for local development)
            $credentialsPath = base_path(env('FCM_CREDENTIALS_PATH'));
            if (file_exists($credentialsPath)) {
                $credentials = json_decode(file_get_contents($credentialsPath), true);
            }
        }
        
        if (!$projectId || !$credentials) {
            Log::error('FCM configuration missing', [
                'project_id' => $projectId,
                'has_credentials' => !empty($credentials),
            ]);
            return false;
        }
        
        try {
            // Get OAuth2 access token
            $accessToken = $this->getAccessToken($credentials);
            
            if (!$accessToken) {
                Log::error('Failed to get FCM access token');
                return false;
            }
            
            // FCM v1 API endpoint
            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'message' => [
                    'token' => $fcmToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => [
                        'type' => 'bill_reminder',
                        'bill_id' => (string) $billId,
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ],
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'sound' => 'default',
                            'channel_id' => 'bill_reminders',
                        ],
                    ],
                ],
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
    
    private function getAccessToken($credentials)
    {
        try {
            // Create JWT
            $now = time();
            $payload = [
                'iss' => $credentials['client_email'],
                'sub' => $credentials['client_email'],
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            ];
            
            // Create JWT header
            $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
            $base64UrlHeader = $this->base64UrlEncode($header);
            
            // Create JWT payload
            $base64UrlPayload = $this->base64UrlEncode(json_encode($payload));
            
            // Create signature
            $signatureInput = $base64UrlHeader . '.' . $base64UrlPayload;
            $signature = '';
            openssl_sign($signatureInput, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256);
            $base64UrlSignature = $this->base64UrlEncode($signature);
            
            // Create JWT
            $jwt = $signatureInput . '.' . $base64UrlSignature;
            
            // Exchange JWT for access token
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['access_token'] ?? null;
            }
            
            Log::error('Failed to get access token', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            
            return null;
        } catch (\Exception $e) {
            Log::error('Access token exception: ' . $e->getMessage());
            return null;
        }
    }
    
    private function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
