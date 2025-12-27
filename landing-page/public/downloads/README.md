# Downloads Directory

This directory contains the Attendly mobile app APK file for download.

## 📦 Quick Setup (Simple Method)

### For Local Development:

**Option 1: Use any test APK**
```bash
# Just place ANY React Native APK here for testing
cp /path/to/your/test.apk attendly.apk
```

**Option 2: Build with Android Studio**
```bash
# See ../../../APK_SIMPLE_GUIDE.md for detailed steps
cd ../../../mobile-app
npx expo prebuild --platform android
# Open android/ folder in Android Studio
# Build → Build APK
# Copy from: android/app/build/outputs/apk/release/app-release.apk
```

**Option 3: Use Expo Go (No APK needed!)**
```bash
# Users install Expo Go app from Play Store
# Scan QR code from: cd mobile-app && npm start
# No APK building required!
```

### For Production:

**Manual Upload:**
1. Build APK using Android Studio (one-time)
2. Place it here: `attendly.apk`
3. Commit to Git: `git add attendly.apk && git commit -m "Update APK"`
4. Push to GitHub
5. Landing page downloads from GitHub raw URL

**GitHub URL:**
```
https://github.com/shivamj-0303/Attendly/raw/main/landing-page/public/downloads/attendly.apk
```

## 🎯 Recommended Approach

Use **Expo Go** for now (no complex builds):
- Users install Expo Go from Play Store
- Share QR code or deep link
- Zero APK building hassle!

See `../../../APK_SIMPLE_GUIDE.md` for all options.

