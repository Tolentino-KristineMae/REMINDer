# FCM Token Debugging Guide

## Changes Made
Added comprehensive logging throughout the FCM token flow to identify where it's failing.

## What to Do Next

### Step 1: Rebuild and Install the App
```bash
cd flutter_app
flutter build apk
flutter install
```

### Step 2: Clear App Data (Important!)
On your device:
1. Go to Settings → Apps → REMINDer
2. Tap "Storage"
3. Tap "Clear Data" (this will clear SharedPreferences)
4. This ensures a fresh start

### Step 3: Login and Watch the Logs
```bash
flutter logs
```

Or if you want to filter for our debug messages:
```bash
flutter logs | findstr /C:"FCM" /C:"Auth token" /C:"✅" /C:"❌" /C:"🔔"
```

### Step 4: What to Look For in Flutter Logs

**Expected Flow:**
1. ✅ Auth token saved to SharedPreferences: [token preview]
2. 🔔 Getting FCM token after login...
3. 🔔 FCM token obtained: [token preview]
4. 📤 Attempting to send FCM token to backend...
5. FCM Token: [token preview]
6. Request headers: {Authorization: Bearer [token]}
7. Request URL: https://reminder-system-3j70.onrender.com/api/user/fcm-token
8. Response status: 200
9. ✅ FCM token successfully sent to backend

**If it fails, you'll see:**
- ❌ No auth token found in SharedPreferences
- ❌ No FCM token available
- Response status: 401 (Unauthenticated)
- Response status: 422 (Validation error)

### Step 5: Check Backend Logs
In your Laravel backend terminal:
```bash
cd Rback
tail -f storage/logs/laravel.log
```

Look for:
- 📥 FCM Token Update Request Received
- ✅ FCM Token Updated Successfully
- ❌ FCM Token Update: User not authenticated

### Step 6: Verify Database
After login, check if the token was saved:
```bash
php artisan tinker --execute="print_r(DB::select('SELECT email, fcm_token FROM users WHERE fcm_token IS NOT NULL'));"
```

### Step 7: Test Notifications
Once you see a user with an FCM token:
```bash
php artisan bills:send-reminders
```

## Key Changes Made

### 1. Added 500ms Delay After Login
This ensures the auth token is fully persisted to SharedPreferences before trying to send the FCM token.

### 2. Comprehensive Logging
- **ApiService**: Logs token save/retrieve operations
- **AuthProvider**: Logs FCM token retrieval and sending after login
- **Dashboard**: Logs FCM token sending on dashboard load
- **Backend**: Logs all FCM token update requests

### 3. Better Error Messages
All errors now include context about what failed and why.

## Troubleshooting

### If Auth Token Not Saving
- Check SharedPreferences permissions
- Try uninstalling and reinstalling the app
- Check for any errors during login

### If FCM Token Not Available
- Check Firebase configuration
- Ensure google-services.json is in android/app/
- Check notification permissions

### If Request Not Reaching Backend
- Check internet connection
- Verify backend URL is correct
- Check if auth token is in request headers

### If Backend Returns 401
- Auth token is not being sent
- Auth token is invalid/expired
- User is not authenticated

## Next Steps After Testing

Once you run the app and login, share the Flutter logs output here. The detailed logging will show us exactly where the flow is breaking.
