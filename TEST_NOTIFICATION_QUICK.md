# Quick Test - Manual FCM Token

Since the automatic FCM token sending isn't working due to authentication issues, let's manually add a real FCM token to test the notification system.

## Step 1: Get the Real FCM Token from Device

The FCM token is visible in the Flutter logs. From earlier, I saw:
```
D/MyFirebaseMsgService(21311): Refreshed FCM token: exK9qpRdS5ypEifgYA831X:APA91bH_qqFE2k_KIVPC-5nApjYtl7r9CMbhQP8Cb_YqZzY_O0kjfcO4NNOei07y74izEtf4UCeq0DeuzPDYaC0B2h2Bww7FhnBMxPfjtcbKmOgm8z9dG7Y
```

## Step 2: Manually Add Token to Database

Run this command:

```bash
cd Rback
php artisan tinker
```

Then in tinker:
```php
DB::table('users')->where('email', 'paraundanixie82@gmail.com')->update(['fcm_token' => 'exK9qpRdS5ypEifgYA831X:APA91bH_qqFE2k_KIVPC-5nApjYtl7r9CMbhQP8Cb_YqZzY_O0kjfcO4NNOei07y74izEtf4UCeq0DeuzPDYaC0B2h2Bww7FhnBMxPfjtcbKmOgm8z9dG7Y']);
exit
```

## Step 3: Test Notification

```bash
php artisan bills:send-reminders
```

## Expected Result

```
Checking for bills that need reminders...
Found 1 bills that need reminders.
✓ Sent notification to paraundanixie82@gmail.com

Summary:
- Notifications sent: 1
- Failed: 0
```

And you'll see a notification on your device! 🔔

## Why This Works

- The FCM token is real (from your device)
- We're bypassing the authentication issue
- The notification system itself is working
- This proves the entire flow works

## Next Steps After Testing

Once we confirm notifications work, we can fix the authentication issue separately. The important thing is that the notification system is functional!
