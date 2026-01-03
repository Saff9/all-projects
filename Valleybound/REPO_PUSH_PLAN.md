# Repo Push Plan

When the GitHub repository link is provided, push this `game` folder as the repository root.

Expected root layout:

```text
.github/workflows/android-apk.yml
android/
native/
docs/
assets/
preview/
README.md
```

The Android workflow expects `android/` at repository root. If the repository already has files, merge carefully and keep `.github/workflows/android-apk.yml` at the root.

## Push checklist

1. Clone the repository.
2. Copy the contents of this `game` folder into the repo root.
3. Commit the Android project, native Windows prototype, docs, and workflow.
4. Push to `main` or `master`.
5. Open GitHub Actions.
6. Download the `valleybound-debug-apk` artifact from the Android APK workflow.
7. Install `app-debug.apk` on Android for testing.

## Important

The APK produced by this workflow is a debug APK. It is suitable for testing on a phone, not Play Store release.
