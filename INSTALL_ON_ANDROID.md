# 📱 Install REMINDer App on Android Phone

## Method 1: Transfer APK via USB Cable

### Step 1: Copy APK to Phone
1. **Connect phone to computer** via USB cable
2. **Enable File Transfer** on phone (select "File Transfer" or "MTP" mode)
3. **Copy APK file** from computer to phone:
   - Source: `C:\xampp\htdocs\REMINDer\REMINDer-app.apk`
   - Destination: Phone's `Download` folder

### Step 2: Install on Phone
1. **Open File Manager** on phone
2. **Go to Downloads** folder
3. **Tap on** `REMINDer-app.apk`
4. **Allow installation from unknown sources** (if prompted)
   - Settings → Security → Unknown sources → Enable
   - Or: Settings → Apps → Special access → Install unknown apps → Allow for File Manager
5. **Tap Install**
6. **Tap Open** after installation

---

## Method 2: Transfer via Google Drive / Cloud

### Step 1: Upload to Google Drive
1. **Go to** https://drive.google.com
2. **Upload** `REMINDer-app.apk` from:
   - `C:\xampp\htdocs\REMINDer\REMINDer-app.apk`

### Step 2: Download on Phone
1. **Open Google Drive** on phone
2. **Find** `REMINDer-app.apk`
3. **Download** the file
4. **Open** the downloaded file
5. **Install** (allow unknown sources if needed)

---

## Method 3: Transfer via Bluetooth

### Step 1: Send via Bluetooth
1. **Right-click** `REMINDer-app.apk` on computer
2. **Select** "Send to" → "Bluetooth device"
3. **Select** target phone
4. **Accept** on phone

### Step 2: Install
1. **Open notification** on phone
2. **Tap** the APK file
3. **Install** (allow unknown sources if needed)

---

## Method 4: Transfer via Email

### Step 1: Email to Yourself
1. **Compose email** with APK attached
2. **Send to** your email address

### Step 2: Download and Install
1. **Open email** on phone
2. **Download** attachment
3. **Open** and **install**

---

## Method 5: Direct Download (If Hosted)

If you upload the APK to a web server:
1. **Open browser** on phone
2. **Visit** the download URL
3. **Download** APK
4. **Install**

---

## 🔐 Security Settings

### Enable Installation from Unknown Sources

**Android 8.0 and above:**
1. Settings → Apps & notifications
2. Special app access
3. Install unknown apps
4. Select your browser/file manager
5. Allow from this source

**Android 7.1 and below:**
1. Settings → Security
2. Unknown sources → Enable

---

## ✅ After Installation

### First Time Setup
1. **Open app**
2. **Allow notifications** when prompted
3. **Login** with your account:
   - Email: your-email@gmail.com
   - Password: your-password

### Verify Notifications Work
1. **Login to app**
2. **Wait a few seconds** for FCM token to register
3. **Test notification** by triggering manually:
   - Visit: https://reminder-system-3j70.onrender.com/api/trigger-reminders
   - Or wait for daily 9 AM notification

---

## 📋 APK File Location

The APK file is located at:
```
C:\xampp\htdocs\REMINDer\REMINDer-app.apk
```

File size: ~50-60 MB

---

## 🔧 Troubleshooting

### "App not installed" error
- **Solution:** Uninstall old version first, then reinstall

### "Parse error" or "File corrupted"
- **Solution:** Re-download or re-copy the APK file

### No notifications received
- **Solution:** 
  1. Logout and login again in the app
  2. Check notification permissions in phone settings
  3. Ensure internet connection is active

### App crashes on startup
- **Solution:**
  1. Clear app data: Settings → Apps → REMINDer → Storage → Clear data
  2. Reinstall the app

---

## 📱 Supported Devices

- **Android version:** 5.0 (Lollipop) and above
- **Architecture:** ARM, ARM64, x86, x86_64
- **Storage:** ~100 MB free space required

---

## 🎯 Multiple Devices

You can install the app on **unlimited devices**:
- Each device will have its own FCM token
- All devices will receive notifications
- Login with the same account on all devices

---

## 🔄 Updates

To update the app:
1. **Build new APK** (when you make changes)
2. **Transfer to phone** (same methods above)
3. **Install** (will update existing app)
4. **No need to uninstall** old version

---

**Ready to install!** 🚀

Just copy `REMINDer-app.apk` to the other phone and install! 📱
