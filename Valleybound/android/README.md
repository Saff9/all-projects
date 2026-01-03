# Valleybound Android

This is the Android native C++ build of the Valleybound prototype.

It uses:

- Android NativeActivity.
- C++17 gameplay code.
- OpenGL ES 2.0 rendering.
- CMake external native build.
- Gradle Android plugin.

## Controls

- Left side of the screen: virtual movement stick.
- Right side tap: action/interact.

## Build locally

From this folder:

```bat
gradle assembleDebug
```

The APK is created at:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## GitHub Actions

The workflow at `../.github/workflows/android-apk.yml` builds a debug APK on push, pull request, or manual dispatch, then uploads it as an artifact named `valleybound-debug-apk`.

## Current gameplay

- Move player through the Kashmir-inspired valley map.
- Push debris away from the broken crossing.
- Gather wood, stone, and herbs.
- Repair the bridge.
- Help the sheep.
- Repair the family roof.
- Avoid river current before the bridge is repaired.

This is a real native Android prototype, not a web build.
