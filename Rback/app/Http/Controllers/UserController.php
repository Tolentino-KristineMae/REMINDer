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
        $request->validate([
            'token' => 'required|string|max:500',
        ]);

        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user->update([
            'fcm_token' => $request->token
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
