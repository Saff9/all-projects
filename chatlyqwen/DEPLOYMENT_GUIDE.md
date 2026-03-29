# 🚀 Chatly Deployment Guide

<div align="center">

# Deploy Chatly to Production

*Complete deployment instructions for all platforms*

</div>

---

## 📋 Deployment Overview

This guide covers deploying Chatly to various platforms and services. Choose the option that best fits your needs.

### Quick Reference

| Platform | Setup Time | Cost | Best For |
|----------|------------|------|----------|
| **Firebase Hosting** | 15 mins | Free tier | Quick web deployment |
| **Vercel** | 10 mins | Free tier | Modern web apps |
| **Netlify** | 10 mins | Free tier | Static sites |
| **Google Play Store** | 2-3 hours | $25 one-time | Android users |
| **Apple App Store** | 4-6 hours | $99/year | iOS users |
| **Self-hosted** | 1-2 days | Variable | Full control |

---

## 🌐 Web Deployment

### Firebase Hosting (Recommended)

#### Prerequisites
- Firebase account
- Node.js installed
- Flutter web build ready

#### Step 1: Install Firebase CLI
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify login
firebase projects:list
```

#### Step 2: Initialize Firebase Project
```bash
# Create/select Firebase project
firebase projects:create chatly-production
# OR select existing: firebase use chatly-production

# Initialize hosting
firebase init hosting
```

**Configuration Options:**
```
? What do you want to use as your public directory? build/web
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
? File build/web/index.html already exists. Overwrite? No
```

#### Step 3: Configure Firebase Services
```bash
# Enable required services
firebase init firestore
firebase init functions
firebase init storage
```

#### Step 4: Build and Deploy
```bash
# Build web version
flutter build web --release

# Deploy to Firebase
firebase deploy

# Get deployment URL
firebase hosting:channel:deploy production
```

#### Step 5: Configure Custom Domain (Optional)
```bash
# Add custom domain
firebase hosting:sites:create chatly.com

# Configure DNS records in domain provider
# Point domain to Firebase hosting
```

**✅ Live URL:** `https://chatly-production.firebaseapp.com`

### Vercel Deployment

#### Prerequisites
- Vercel account
- GitHub repository (recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### Step 2: Deploy from Repository
```bash
# Clone and prepare
git clone https://github.com/your-username/chatly.git
cd chatly

# Build web version
flutter build web --release

# Deploy to Vercel
vercel --prod

# Answer prompts:
# Set up and deploy? → Y
# Which scope? → Your account
# Link to existing project? → N
# Project name → chatly
# Directory → ./build/web
```

#### Step 3: Configure Build Settings
Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "build/web/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Step 4: Environment Variables
```bash
# Set Firebase config in Vercel dashboard
# VERCEL_ENV_FIREBASE_API_KEY=your_api_key
# VERCEL_ENV_FIREBASE_PROJECT_ID=your_project_id
```

**✅ Live URL:** `https://chatly.vercel.app`

### Netlify Deployment

#### Prerequisites
- Netlify account
- GitHub repository

#### Step 1: Connect Repository
```bash
# Push code to GitHub first
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy via Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli
netlify login

# Build and deploy
flutter build web --release
netlify deploy --prod --dir=build/web

# Or link existing site
netlify link
netlify deploy --prod
```

#### Step 3: Configure Build Settings
Create `netlify.toml`:
```toml
[build]
  command = "flutter build web --release"
  publish = "build/web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 4: Environment Variables
```bash
# Set in Netlify dashboard
# FIREBASE_API_KEY=your_api_key
# FIREBASE_PROJECT_ID=your_project_id
```

**✅ Live URL:** `https://chatly.netlify.app`

---

## 📱 Mobile App Deployment

### Android (Google Play Store)

#### Prerequisites
- Google Play Console account ($25 one-time)
- Android Studio installed
- Keystore generated

#### Step 1: Prepare Android Build
```bash
# Generate keystore (one-time)
keytool -genkey -v -keystore ~/chatly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chatly

# Configure signing in Android
# File: android/key.properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=chatly
storeFile=../chatly-key.jks
```

#### Step 2: Update Build Configuration
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("CHATLY_KEYSTORE") ?: 'chatly-key.jks')
            storePassword System.getenv("CHATLY_STORE_PASSWORD")
            keyAlias System.getenv("CHATLY_KEY_ALIAS")
            keyPassword System.getenv("CHATLY_KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Step 3: Build APK/AAB
```bash
# For APK (traditional)
flutter build apk --release

# For AAB (recommended for Play Store)
flutter build appbundle --release
```

#### Step 4: Upload to Google Play Console

1. **Create App:**
   - Go to Google Play Console
   - Create new app
   - Fill app details and privacy policy

2. **Upload Bundle:**
   - Release → Production
   - Upload `build/app/outputs/bundle/release/app-release.aab`
   - Add release notes

3. **Configure Store Listing:**
   - App title, description, screenshots
   - Feature graphics, icons
   - Privacy policy URL
   - Contact information

4. **Publish:**
   - Review and submit for review
   - Takes 1-3 days for approval

**📱 Download:** `https://play.google.com/store/apps/details?id=com.chatly.app`

### iOS (Apple App Store)

#### Prerequisites
- Apple Developer Program ($99/year)
- macOS with Xcode
- iOS device for testing

#### Step 1: Configure iOS Project
```bash
# Configure bundle ID
# ios/Runner.xcodeproj/project.pbxproj
# PRODUCT_BUNDLE_IDENTIFIER = com.chatly.app
```

#### Step 2: Add App Store Icons
```
ios/Runner/Assets.xcassets/AppIcon.appiconset/
├── icon_1024x1024.png
├── icon_167x167.png
├── icon_152x152.png
├── icon_120x120.png
├── icon_87x87.png
├── icon_80x80.png
├── icon_76x76.png
├── icon_60x60.png
├── icon_58x58.png
├── icon_40x40.png
├── icon_29x29.png
└── icon_20x20.png
```

#### Step 3: Build for iOS
```bash
# Install CocoaPods
sudo gem install cocoapods

# Install dependencies
cd ios
pod install
cd ..

# Build for iOS
flutter build ios --release
```

#### Step 4: Archive and Upload
```bash
# Open in Xcode
open ios/Runner.xcworkspace

# Archive the app
# Product → Archive

# Upload to App Store Connect
# Window → Organizer → Upload to App Store
```

#### Step 5: App Store Connect Setup

1. **Create App:**
   - App Store Connect → Apps → +
   - Fill app information

2. **Prepare for Submission:**
   - Screenshots for all device sizes
   - App description and keywords
   - Privacy policy URL
   - Support URLs

3. **Submit for Review:**
   - TestFlight beta testing (optional)
   - Submit production build
   - Takes 1-7 days for review

**📱 Download:** `https://apps.apple.com/app/chatly/id123456789`

---

## 💻 Desktop Deployment

### Windows

#### Build Windows App
```bash
flutter build windows --release
```

#### Package as Installer
```bash
# Create NSIS installer
# build\windows\runner\Release\ → Package with NSIS

# Or use flutter_distributor
flutter pub global activate flutter_distributor
flutter_distributor package --platform windows --targets msi
```

#### Distribution
- **Microsoft Store:** Submit via Partner Center
- **Direct Download:** Host MSI on website
- **Enterprise:** Deploy via SCCM/Intune

### macOS

#### Build macOS App
```bash
flutter build macos --release
```

#### Package as DMG
```bash
# Create .app bundle
# build/macos/Build/Products/Release/ → Create DMG

# Use create-dmg
brew install create-dmg
create-dmg Chatly.app
```

#### App Store Submission
```bash
# For Mac App Store
# Archive and submit via Xcode
```

### Linux

#### Build Linux App
```bash
flutter build linux --release
```

#### Package as AppImage/Snap
```bash
# Create AppImage
# build/linux/release/bundle/ → Convert to AppImage

# Or create Snap package
snapcraft pack .
```

---

## 🔧 Advanced Deployment

### CI/CD Pipeline

#### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Chatly

on:
  push:
    branches: [ main ]

jobs:
  deploy-web:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.10.3'

    - run: flutter pub get

    - run: flutter build web --release

    - uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: chatly-production
```

#### Firebase CI/CD
```yaml
# .firebaserc
{
  "projects": {
    "default": "chatly-production"
  },
  "hosting": {
    "chatly": {
      "target": "chatly",
      "public": "build/web",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  }
}
```

### Docker Deployment

#### Dockerfile for Self-Hosting
```dockerfile
FROM ubuntu:20.04

# Install Flutter
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

# Install Flutter SDK
RUN git clone https://github.com/flutter/flutter.git -b stable --depth 1 /flutter
ENV PATH="/flutter/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Build web app
RUN flutter pub get
RUN flutter build web --release

# Serve with nginx
FROM nginx:alpine
COPY --from=0 /app/build/web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Deploy with Docker
```bash
# Build and run
docker build -t chatly .
docker run -p 80:80 chatly
```

---

## 🔒 Security Configuration

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isPublicProfile(userId);
    }

    // Chats collection
    match /chats/{chatId} {
      allow read, write: if isParticipant(chatId, request.auth.uid);
    }

    // Messages subcollection
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if isParticipant(chatId, request.auth.uid);
      allow create: if isValidMessage() && rateLimit();
    }
  }

  function isParticipant(chatId, userId) {
    return get(/databases/$(database)/documents/chats/$(chatId))
      .data.participants.hasAny(userId);
  }

  function isValidMessage() {
    return request.resource.data.text is string
        && request.resource.data.text.size() <= 1000
        && request.resource.data.timestamp == request.time;
  }

  function rateLimit() {
    return get(/databases/$(database)/documents/rate_limits/$(request.auth.uid))
      .data.count < 100; // Max 100 messages per minute
  }
}
```

### Environment Variables

#### Production Environment
```bash
# Firebase Configuration
FIREBASE_API_KEY=your_production_api_key
FIREBASE_AUTH_DOMAIN=chatly-production.firebaseapp.com
FIREBASE_PROJECT_ID=chatly-production
FIREBASE_STORAGE_BUCKET=chatly-production.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# App Configuration
CHATLY_ENVIRONMENT=production
CHATLY_API_URL=https://api.chatly.com
CHATLY_VERSION=1.0.0
```

---

## 📊 Monitoring & Analytics

### Firebase Analytics Setup
```dart
// lib/core/services/analytics_service.dart
class AnalyticsService {
  static void initialize() {
    // Firebase Analytics already configured
  }

  static void logEvent(String event, Map<String, dynamic> parameters) {
    FirebaseAnalytics.instance.logEvent(
      name: event,
      parameters: parameters,
    );
  }

  static void logUserAction(String action) {
    logEvent('user_action', {'action': action});
  }

  static void logScreenView(String screenName) {
    FirebaseAnalytics.instance.setCurrentScreen(screenName: screenName);
  }
}
```

### Performance Monitoring
```dart
// lib/core/services/performance_service.dart
class PerformanceService {
  static void monitorWebVitals() {
    // Web vitals monitoring
    // Core Web Vitals: LCP, FID, CLS
  }

  static void trackErrors(dynamic error, StackTrace stack) {
    FirebaseCrashlytics.instance.recordError(error, stack);
  }
}
```

---

## 🔄 Updates & Maintenance

### Version Management
```yaml
# pubspec.yaml
version: 1.0.0+1

# Android version codes
android/app/build.gradle:
versionCode 1
versionName "1.0.0"
```

### Rollback Strategy
```bash
# Firebase Hosting rollback
firebase hosting:rollback

# Vercel rollback
vercel rollback

# App Store rollback
# Submit previous version to stores
```

### Update Strategy
```bash
# Force update mechanism
class UpdateService {
  static void checkForUpdates() {
    // Check app version vs server version
    // Prompt user to update if needed
  }
}
```

---

## 🆘 Troubleshooting

### Common Deployment Issues

#### Firebase Build Fails
```
Solutions:
• Check Firebase permissions
• Verify project configuration
• Clear Firebase cache: firebase logout && firebase login
• Check quota limits in Firebase console
```

#### Web App Not Loading
```
Check:
• Service worker conflicts
• Browser cache issues
• Firebase hosting configuration
• CORS settings
```

#### Mobile App Crashes
```
Debug:
• Check device logs
• Verify Firebase configuration
• Test on different devices
• Check app permissions
```

#### Performance Issues
```
Optimize:
• Enable gzip compression
• Use CDN for static assets
• Implement lazy loading
• Optimize bundle size
```

---

## 📞 Support & Resources

### Official Documentation
- [Flutter Deployment](https://flutter.dev/docs/deployment)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Vercel Flutter](https://vercel.com/docs/frameworks/flutter)
- [Google Play Console](https://developer.android.com/distribute/console)

### Community Resources
- [Flutter Discord](https://discord.gg/flutter)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/flutter)

### Professional Services
- **Deployment Consulting:** Contact Chatly team
- **Enterprise Support:** Premium SLA options
- **Custom Integrations:** Bespoke solutions

---

<div align="center">

## 🎯 Deployment Complete!

*Your Chatly app is now live and ready for users worldwide*

**🚀 Choose your deployment platform and start serving users today!**

[⬆️ Back to Top](#-chatly-deployment-guide)

</div>