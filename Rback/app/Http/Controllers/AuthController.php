<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $fullName = $request->first_name . ' ' . $request->last_name;
        
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $fullName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $storedPassword = (string) $user->password;
        $looksHashed = str_starts_with($storedPassword, '$2y$')
            || str_starts_with($storedPassword, '$2a$')
            || str_starts_with($storedPassword, '$argon2');

        $passwordMatches = $looksHashed
            ? Hash::check($request->input('password'), $storedPassword)
            : hash_equals($storedPassword, (string) $request->input('password'));

        if (!$passwordMatches) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        if (!$looksHashed) {
            $user->password = Hash::make($request->input('password'));
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Temporary endpoint to create a user (for setup only)
    public function createUser(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        $fullName = $request->first_name . ' ' . $request->last_name;

        $user = User::updateOrCreate(
            ['email' => $request->email],
            [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'name' => $fullName,
                'password' => Hash::make($request->password),
            ]
        );

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ]);
    }
}
