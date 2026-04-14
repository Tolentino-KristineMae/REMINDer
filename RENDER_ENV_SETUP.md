# Render Environment Variable Setup (Free Tier)

Since Render free tier doesn't have shell access, we'll use environment variables to store the Firebase credentials.

## Step 1: Copy the Firebase JSON

The Firebase service account JSON is located at:
```
Rback/storage/app/firebase/firebase-service-account.json
```

Copy the ENTIRE content of this file (it's a single line JSON).

## Step 2: Add to Render Environment Variables

1. **Go to Render Dashboard**
   - https://dashboard.render.com
   - Select your backend service (reminder-system)

2. **Go to Environment Tab**
   - Click "Environment" in the left sidebar

3. **Add New Environment Variable**
   - Click "Add Environment Variable"
   
4. **Add FCM_CREDENTIALS_JSON**
   - **Key:** `FCM_CREDENTIALS_JSON`
   - **Value:** Paste the entire JSON content from the file
   
   Example format (yours will be different):
   ```json
   {"type":"service_account","project_id":"billreminderapp-690ed","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
   ```

5. **Verify FCM_PROJECT_ID exists**
   - Should already be there: `FCM_PROJECT_ID=billreminderapp-690ed`
   - If not, add it

6. **Save Changes**
   - Click "Save Changes"
   - Render will automatically redeploy

## Step 3: Test After Deployment

After deployment completes (2-3 minutes), test the notifications:

1. **Login to your Flutter app** (to ensure FCM token is saved)

2. **Manually trigger from your local machine:**
   ```bash
   # This will call the deployed backend
   curl -X POST https://reminder-system-3j70.onrender.com/api/trigger-reminders
   ```

3. **Check your phone** - you should receive a notification! 📱

## Verification

To verify the setup is working, check the Render logs:
- Go to Render Dashboard → Your Service → Logs
- Look for: `FCM notification sent successfully`

## Automatic Daily Notifications

### Option 1: External Cron Service (Recommended for Free Tier)

Use **cron-job.org** (free):

1. Go to https://cron-job.org
2. Create account
3. Create new cron job:
   - **Title:** Bill Reminders
   - **URL:** `https://reminder-system-3j70.onrender.com/api/trigger-reminders`
   - **Schedule:** Daily at 9:00 AM (Manila timezone)
   - **Method:** POST

### Option 2: Render Cron Job (Paid Plans Only)

If you upgrade to a paid plan:
- Command: `php artisan bills:send-reminders`
- Schedule: `0 1 * * *` (9 AM Manila = 1 AM UTC)

## Troubleshooting

### If notifications don't work:

1. **Check Render Logs** for errors
2. **Verify environment variable** is set correctly (no extra spaces)
3. **Ensure JSON is valid** - use https://jsonlint.com to validate
4. **Check FCM tokens** in database:
   ```sql
   SELECT email, fcm_token FROM users WHERE fcm_token IS NOT NULL;
   ```

### Common Issues:

- **"FCM configuration missing"** - Environment variable not set or invalid JSON
- **"Failed to get access token"** - Private key format issue (check newlines)
- **"UNREGISTERED"** - FCM token expired, user needs to login again

## Security Note

⚠️ The Firebase service account JSON contains sensitive credentials. Make sure:
- It's stored as a Render environment variable (encrypted at rest)
- It's NOT committed to Git (already in .gitignore)
- Only authorized team members have access to Render dashboard
