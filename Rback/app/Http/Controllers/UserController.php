<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Update the user's FCM token for push notifications
     */
    public function updateFCMToken(Request $request)
    {
        \Log::info('📥 FCM Token Update Request Received', [
            'user_id' => $request->user() ? $request->user()->id : 'none',
            'has_token' => $request->has('token'),
            'token_length' => $request->has('token') ? strlen($request->token) : 0,
        ]);

        $request->validate([
            'token' => 'required|string|max:500',
        ]);

        $user = $request->user();
        
        if (!$user) {
            \Log::error('❌ FCM Token Update: User not authenticated');
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user->update([
            'fcm_token' => $request->token
        ]);

        \Log::info('✅ FCM Token Updated Successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'token_preview' => substr($request->token, 0, 50) . '...',
        ]);

        return response()->json([
            'message' => 'FCM token updated successfully',
            'token' => $request->token
        ]);
    }

    /**
     * Get the current user's profile
     */
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
