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
