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
     */
    public function sendSms(string $toPhone, string $content): bool
    {
        $apiKey = config('services.brevo.key');
        $sender = config('services.brevo.sms_sender');

        if (!$apiKey || !$sender) {
            Log::warning('Brevo SMS configuration missing');
            return false;
        }

        // Ensure phone number is in international format
        $toPhone = preg_replace('/[^0-9]/', '', $toPhone);
        if (!preg_match('/^\\d{10,15}$/', $toPhone)) {
            Log::warning('Invalid phone number format for Brevo SMS', ['phone' => $toPhone]);
            return false;
        }

        try {
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'api-key' => $apiKey,
                'content-type' => 'application/json',
            ])->post('https://api.brevo.com/v3/transactionalSMS/sms', [
                'sender' => $sender,
                'recipient' => $toPhone,
                'content' => $content,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Brevo SMS sending failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'to' => $toPhone,
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Brevo SMS service exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }
}