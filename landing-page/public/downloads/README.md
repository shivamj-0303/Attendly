# Downloads Directory

This directory is **no longer used** for storing APK files in the repository.

## 📦 Current Setup (GitHub Releases)

### APK Distribution:

The Attendly mobile app APK is now automatically uploaded to **GitHub Releases**.

**Production APK URL:**
```
https://github.com/shivamj-0303/Attendly/releases/latest/download/attendly.apk
```

### How it Works:

1. **Automatic Build**: When code is pushed to `main`, GitHub Actions builds the APK
2. **Release Creation**: Creates a versioned release (e.g., v2025.01.15-build.42)
3. **APK Upload**: Uploads the APK as a release asset
4. **Latest Tag**: Updates the `latest` tag to always point to the newest release
5. **Landing Page**: Downloads APK from `/releases/latest/download/attendly.apk`

### Benefits:

- ✅ No binary files in Git (cleaner repo history)
- ✅ Automatic versioning with build numbers
- ✅ Release notes with commit details
- ✅ Easy rollback to previous versions
- ✅ Download statistics tracking
- ✅ GitHub CDN for fast downloads

### For Local Development:

**Option 1: Build locally and test**
```bash
cd ../../../mobile-app
VITE_API_BASE_URL=http://192.168.1.58:8080/api eas build --platform android --profile production --local
# APK will be in mobile-app/build-*.apk
# Copy to this directory for local testing:
cp build-*.apk ../../landing-page/public/downloads/attendly.apk
```

**Option 2: Use Expo Go (No APK needed!)**
```bash
cd ../../../mobile-app
npm start
# Users install Expo Go app from Play Store
# Scan QR code - no APK building required!
```

### Viewing Releases:

- **Latest Release**: https://github.com/shivamj-0303/Attendly/releases/latest
- **All Releases**: https://github.com/shivamj-0303/Attendly/releases
- **Direct APK Download**: https://github.com/shivamj-0303/Attendly/releases/latest/download/attendly.apk
- Zero APK building hassle!

See `../../../APK_SIMPLE_GUIDE.md` for all options.

