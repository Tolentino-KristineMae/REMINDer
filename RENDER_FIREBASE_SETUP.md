# Firebase Service Account Setup for Render

## Important: Manual File Upload Required

The Firebase service account JSON file contains sensitive credentials and should NOT be committed to Git. You need to manually upload it to Render.

## Steps to Upload Firebase Credentials to Render:

### Option 1: Using Render Shell (Recommended)

1. **Go to Render Dashboard**
   - https://dashboard.render.com
   - Select your backend service

2. **Open Shell**
   - Click "Shell" tab
   - This opens a terminal in your deployed container

3. **Create Directory**
   ```bash
   mkdir -p storage/app/firebase
   ```

4. **Create the JSON File**
   ```bash
   cat > storage/app/firebase/firebase-service-account.json << 'EOF'
   [PASTE YOUR FIREBASE SERVICE ACCOUNT JSON HERE]
   EOF
   ```
   
   **Note:** Get the JSON content from:
   - Local file: `Rback/storage/app/firebase/firebase-service-account.json`
   - Or download again from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

5. **Verify the File**
   ```bash
   cat storage/app/firebase/firebase-service-account.json
   ```

6. **Test Notifications**
   ```bash
   php artisan bills:send-reminders
   ```

### Option 2: Using Environment Variable (Alternative)

If Render Shell doesn't work, you can store the JSON as an environment variable:

1. **Go to Render Dashboard → Environment**

2. **Add Environment Variable:**
   - Key: `FCM_CREDENTIALS_JSON`
   - Value: (paste the entire JSON content)

3. **Update `.env` or code to read from environment variable instead of file**

## Verification

After setup, test the notifications:

```bash
php artisan bills:send-reminders
```

Expected output:
```
Checking for bills that need reminders...
Found X bills that need reminders.
✓ Sent notification to user@example.com
Summary:
- Notifications sent: X
- Failed: 0
```

## Security Notes

- ⚠️ NEVER commit the service account JSON to Git
- ⚠️ Keep the private key secure
- ⚠️ Regenerate the key if it's ever exposed
- ✅ The JSON file is already in .gitignore

## Automatic Daily Notifications

To run notifications automatically every day at 9 AM Manila time:

### Option 1: Render Cron Job
1. Go to Render Dashboard
2. Create new Cron Job
3. Command: `php artisan bills:send-reminders`
4. Schedule: `0 1 * * *` (9 AM Manila = 1 AM UTC)

### Option 2: External Cron Service
Use services like cron-job.org or EasyCron to hit a trigger endpoint daily.
