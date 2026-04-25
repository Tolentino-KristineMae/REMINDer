<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\BrevoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    protected $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }

    /**
     * Send a password reset token.
     * Supports both email (reset link) and SMS (OTP) methods.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'method' => 'required|in:email,sms',
            'email' => 'required_if:method,email|email',
            'phone' => 'required_if:method,sms|regex:/^\+?[0-9]{10,15}$/',
        ]);

        if ($request->method === 'email') {
            $user = User::where('email', $request->email)->first();

            // Always return success to prevent email enumeration
            if (!$user) {
                return response()->json([
                    'message' => 'If that email exists, a reset link has been sent.',
                ]);
            }

            // Delete any existing token for this email
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            // Generate a secure token
            $token = Str::random(64);

            DB::table('password_reset_tokens')->insert([
                'email'      => $request->email,
                'token'      => Hash::make($token),
                'created_at' => Carbon::now(),
            ]);

            // Send email via Brevo
            $resetUrl = config('app.url') . "/reset-password?email=" . urlencode($request->email) . "&token=" . urlencode($token);
            $this->brevoService->sendEmail(
                $request->email,
                $user->getNameAttribute() ?? 'User',
                'Reset Your REMINDEr Password',
                view('emails.password-reset', [
                    'resetUrl' => $resetUrl,
                    'userName' => $user->getNameAttribute() ?? 'User',
                    'expiresMinutes' => 15,
                ])->render()
            );

            return response()->json([
                'message' => 'Reset link sent to your email.',
            ]);
        } else { // sms
            $user = User::where('phone', $request->phone)->first();

            // Always return success to prevent phone enumeration
            if (!$user) {
                return response()->json([
                    'message' => 'If that phone number exists, an OTP has been sent.',
                ]);
            }

            // Delete any existing token for this phone
            DB::table('phone_reset_tokens')->where('phone', $request->phone)->delete();

            // Generate a 6-digit OTP
            $otp = mt_rand(100000, 999999);

            DB::table('phone_reset_tokens')->insert([
                'phone'      => $request->phone,
                'token'      => Hash::make((string)$otp),
                'created_at' => Carbon::now(),
            ]);

            // Send SMS via Brevo
            $this->brevoService->sendSms(
                $request->phone,
                "Your REMINDEr password reset OTP is: {$otp}. It expires in 10 minutes."
            );

            return response()->json([
                'message' => 'OTP sent to your phone.',
            ]);
        }
    }

    /**
     * Reset password using the token.
     * Supports both email and phone verification.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'nullable|email',
            'phone' => 'nullable|regex:/^\+?[0-9]{10,15}$/',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        // Ensure either email or phone is provided
        if (!$request->email && !$request->phone) {
            return response()->json([
                'message' => 'Either email or phone must be provided.',
            ], 422);
        }

        $user = null;
        $tokenRecord = null;

        if ($request->email) {
            $user = User::where('email', $request->email)->first();
            $tokenRecord = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        } elseif ($request->phone) {
            $user = User::where('phone', $request->phone)->first();
            $tokenRecord = DB::table('phone_reset_tokens')->where('phone', $request->phone)->first();
        }

        // Invalid token or user not found
        if (!$user || !$tokenRecord) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // Check token expiration (60 minutes for email, 10 minutes for SMS)
        $expiryMinutes = $request->email ? 60 : 10;

        if (Carbon::parse($tokenRecord->created_at)->addMinutes($expiryMinutes)->isPast()) {
            // Delete expired token
            if ($request->email) {
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            } else {
                DB::table('phone_reset_tokens')->where('phone', $request->phone)->delete();
            }

            return response()->json([
                'message' => 'Reset token has expired. Please request a new one.',
            ], 422);
        }

        if (!Hash::check($request->token, $tokenRecord->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        if ($request->email) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        } else {
            DB::table('phone_reset_tokens')->where('phone', $request->phone)->delete();
        }

        // Revoke all existing tokens so old sessions are invalidated
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully. Please log in with your new password.',
        ]);
    }

    /**
     * Change password for an authenticated user.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Revoke all other tokens (keep current session)
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password changed successfully.']);
    }
}