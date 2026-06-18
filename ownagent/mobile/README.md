# Apex Smart Mobile - Android APK Build Guide

This guide covers building the Apex Smart Android APK using Ionic Capacitor.

## Overview

Apex Smart is wrapped as an Android APK using Capacitor, which embeds the web app in a native WebView. This provides:

- Native app installation and distribution
- Access to device features (file system, sharing, etc.)
- Better performance than browser-based PWA
- Play Store distribution capability

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **Android Studio** (latest stable version)
   - Download from: https://developer.android.com/studio
   - Required for SDK, emulator, and build tools

3. **Java Development Kit (JDK)** 17
   - Bundled with Android Studio or download separately
   - Set `JAVA_HOME` environment variable

4. **Android SDK**
   - Installed via Android Studio SDK Manager
   - Minimum API Level: 21 (Android 5.0)
   - Target API Level: 34 (Android 14)

### Environment Setup

1. **Set Environment Variables** (Windows):
   ```powershell
   # Add to System Environment Variables
   ANDROID_HOME = C:\Users\<username>\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
   
   # Add to PATH
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\cmdline-tools\latest\bin
   ```

2. **Verify Setup**:
   ```bash
   adb --version
   java --version
   ```

## Project Structure

```
frontend/
├── capacitor.config.ts       # Capacitor configuration
├── android/                  # Android project (auto-generated)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml    # App permissions & config
│   │   │   ├── java/com/genzsmart/app/
│   │   │   │   └── MainActivity.java  # Main activity
│   │   │   └── res/                   # Resources (icons, themes)
│   │   ├── build.gradle               # App-level build config
│   │   └── proguard-rules.pro         # ProGuard rules
│   ├── build.gradle                   # Project-level build config
│   └── variables.gradle               # SDK versions
├── src/
│   └── mobile/              # Mobile-specific code
│       ├── bridge.ts        # Native bridge utilities
│       ├── storage.ts       # Native storage wrapper
│       └── index.ts         # Module exports
└── package.json             # Build scripts
```

## Build Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build Web Assets

```bash
npm run build
```

This creates the `dist/` folder with compiled web assets.

### 3. Sync with Android Project

```bash
npx cap sync
```

This copies web assets to the Android project and updates native plugins.

### 4. Build Debug APK

```bash
# Option 1: Using npm script
npm run android:build:debug

# Option 2: Direct gradle command
cd android
.\gradlew assembleDebug
```

The debug APK will be at:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Build Release APK

#### Create Signing Keystore

```bash
cd frontend/android

# Generate keystore (run once)
keytool -genkey -v \
  -keystore release.keystore \
  -alias genzsmart \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important**: Keep `release.keystore` secure and back it up. Losing it means you cannot update the app on Play Store.

#### Configure Signing

Set environment variables:
```powershell
$env:KEYSTORE_PATH = "C:\path\to\frontend\android\release.keystore"
$env:KEYSTORE_PASSWORD = "your_keystore_password"
$env:KEY_ALIAS = "genzsmart"
$env:KEY_PASSWORD = "your_key_password"
```

#### Build Release APK

```bash
# Using npm script
npm run android:build:release

# Or directly
cd android
.\gradlew assembleRelease
```

The release APK will be at:
```
frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 6. Build Android App Bundle (AAB) for Play Store

```bash
npm run android:bundle
```

The AAB will be at:
```
frontend/android/app/build/outputs/bundle/release/app-release.aab
```

## Installation

### Install Debug APK on Device

1. **Enable Developer Options** on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging

3. **Connect device via USB** and install:
   ```bash
   adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Install via Android Studio

1. Open Android Studio
2. File → Open → Select `frontend/android` folder
3. Connect device or start emulator
4. Click "Run" button (▶)

## Development Workflow

### Live Reload (Development)

1. Start dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. In another terminal, run with live reload:
   ```bash
   npx cap run android --livereload --external
   ```

### Making Changes

1. **Web code changes**:
   ```bash
   npm run build
   npx cap sync
   ```

2. **Native code changes** (Android Studio):
   - Open `frontend/android` in Android Studio
   - Make changes to Java/Kotlin files
   - Build directly from Android Studio

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build:mobile` | Build web and sync with Android |
| `npm run android:open` | Open Android Studio |
| `npm run android:run` | Run on connected device/emulator |
| `npm run android:build:debug` | Build debug APK |
| `npm run android:build:release` | Build release APK |
| `npm run android:bundle` | Build AAB for Play Store |
| `npm run sync` | Sync web assets to Android |

## Configuration

### Capacitor Configuration (`capacitor.config.ts`)

```typescript
{
  appId: 'com.genzsmart.app',      // Unique app identifier
  appName: 'Apex Smart',            // Display name
  webDir: 'dist',                   // Web assets directory
  server: {
    androidScheme: 'https',
    cleartext: true                 // Allow HTTP for local dev
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e'    // Match app theme
    }
  }
}
```

### Backend Connection

The app connects to the backend API. Configure the API URL in your environment:

- **Development**: `http://10.0.2.2:8000` (Android emulator localhost)
- **Production**: Your hosted backend URL

Update `frontend/src/services/api.ts` with your backend URL.

## Native Features

### Implemented Capacitor Plugins

| Plugin | Purpose |
|--------|---------|
| `@capacitor/status-bar` | Status bar styling |
| `@capacitor/keyboard` | Keyboard handling |
| `@capacitor/splash-screen` | App launch screen |
| `@capacitor/filesystem` | File operations |
| `@capacitor/share` | Native sharing |
| `@capacitor/preferences` | Key-value storage |

### Using Native Features

```typescript
import { 
  initializeMobileApp, 
  shareContent,
  isNativePlatform 
} from './mobile';

// Initialize on app start
useEffect(() => {
  initializeMobileApp();
}, []);

// Share conversation
const handleShare = async () => {
  await shareContent({
    title: 'Apex Smart Conversation',
    text: conversationText,
  });
};

// Check platform
if (isNativePlatform()) {
  // Use native features
}
```

## Troubleshooting

### Build Issues

**Gradle sync failed**:
```bash
cd android
.\gradlew clean
.\gradlew build
```

**SDK not found**:
- Verify `ANDROID_HOME` environment variable
- Install missing SDK components via Android Studio

**Keystore issues**:
- Ensure keystore path is correct
- Verify keystore password

### Runtime Issues

**White screen on launch**:
- Check `capacitor.config.ts` webDir matches build output
- Verify `npm run build` completed successfully
- Run `npx cap sync`

**Backend connection failed**:
- For emulator: Use `10.0.2.2` instead of `localhost`
- Check `android:usesCleartextTraffic="true"` in AndroidManifest.xml
- Verify backend is running and accessible

**CORS errors**:
- Configure backend to allow requests from `capacitor://localhost`
- Or use native HTTP plugin for requests

### Permission Issues

App requests these permissions (defined in AndroidManifest.xml):
- `INTERNET` - Required for API calls
- `READ_EXTERNAL_STORAGE` - File uploads
- `WRITE_EXTERNAL_STORAGE` - File downloads

## Play Store Deployment

### 1. Prepare Release

- Update version in `android/app/build.gradle`:
  ```gradle
  versionCode 2        # Increment for each release
  versionName "1.0.1"  # User-visible version
  ```

- Build signed AAB:
  ```bash
  npm run android:bundle
  ```

### 2. Google Play Console

1. Create developer account ($25 one-time fee)
2. Create new app
3. Upload AAB to Play Console
4. Complete store listing
5. Set up pricing and distribution
6. Submit for review

### 3. App Signing

Play Store requires app signing:
- Upload your signing keystore
- Google manages the final signing key
- Keep your upload keystore secure

## Security Considerations

1. **Never commit keystore files** to version control
2. **Use environment variables** for sensitive data
3. **Enable ProGuard** for code obfuscation (enabled in release builds)
4. **Use HTTPS** for production API calls
5. **Validate all inputs** on backend

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Play Store Publishing](https://developer.android.com/studio/publish)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Capacitor documentation
3. Check Android Studio logs
4. File an issue with detailed logs
