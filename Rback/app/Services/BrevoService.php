<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoService
{
    /**
     * Send email via Brevo API
     */
    public function sendEmail(string $toEmail, string $toName, string $subject, string $htmlContent): bool
    {
        $apiKey = config('services.brevo.key');
        $senderEmail = config('services.brevo.sender_email');
        $senderName = config('services.brevo.sender_name');

        if (!$apiKey || !$senderEmail) {
            Log::warning('Brevo email configuration missing');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'api-key' => $apiKey,
                'content-type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => [
                    'email' => $senderEmail,
                    'name' => $senderName,
                ],
                'to' => [
                    [
                        'email' => $toEmail,
                        'name' => $toName,
                    ],
                ],
                'subject' => $subject,
                'htmlContent' => $htmlContent,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Brevo email sending failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'to' => $toEmail,
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Brevo email service exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Send SMS via Brevo API
     * DISABLED: SMS functionality removed because it's not free
     */
    /*
    public function sendSms(string $toPhone, string $content): bool
    {
        Log::warning('SMS functionality disabled - Brevo SMS is not free');
        return false;
    }
    */
}