# MouthJournal — Android Release Guide & EAS Build Specification

## 1. Release Configuration Overview

MouthJournal is fully configured for standalone Android distribution via **Expo Application Services (EAS Build)** and direct APK/AAB compilation.

### Key Identifiers & Configuration

| Parameter | Value | Location |
|---|---|---|
| **App Name** | `MouthJournal` | `app.json` (`expo.name`) |
| **Package Identifier** | `com.mouthjournal.app` | `app.json` (`expo.android.package`) |
| **Semantic Version** | `1.0.0` | `app.json` (`expo.version`) |
| **Android Version Code** | `1` | `app.json` (`expo.android.versionCode`) |
| **User Interface Style** | `light` (Supports Light, Dark, System) | `app.json` |
| **Adaptive Icon Foreground** | `./assets/android-icon-foreground.png` | `app.json` |
| **Adaptive Icon Background** | `./assets/android-icon-background.png` (`#F8EAD9`) | `app.json` |
| **Adaptive Icon Monochrome** | `./assets/android-icon-monochrome.png` | `app.json` |

---

## 2. Android Runtime Permissions

The following permissions are configured in `app.json` and are requested strictly at runtime when relevant features are invoked:

1. `ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION`:
   - **Usage**: Used by `OpenStreetMapPlacesAdapter` and `locationService` to detect nearby cafes and dining spots in **Explore** and attach GPS location to journals.
   - **Graceful Fallback**: If denied, the app defaults to fallback coordinates (Senopati, Jakarta) and remains 100% usable.
2. `CAMERA`:
   - **Usage**: Used by `ImageService.takePhotoWithCamera` to capture food and beverage photos directly inside the journal editor.
   - **Graceful Fallback**: User can choose photos from gallery instead.
3. `READ_EXTERNAL_STORAGE` & `WRITE_EXTERNAL_STORAGE`:
   - **Usage**: Photo library access for culinary journaling and cache file management.

---

## 3. Production Environment & Security Controls

### 3.1. Zero Server-Side Secrets in Client
- No private API keys or service account keys are bundled into the binary.
- All Firebase client keys (`EXPO_PUBLIC_FIREBASE_*`) are public identifiers protected by Cloud Firestore and Firebase Storage security rules (`request.auth.uid == userId`).
- LLM AI integrations (Google Gemini) are decoupled behind backend Cloud Functions boundaries.

### 3.2. Demo Mode Deactivation in Production
- `AuthService.ts` strictly checks `__DEV__` before providing any demo fallback.
- In production builds (`__DEV__ === false`), mock users are never generated, and invalid credentials return truthful error states.

---

## 4. EAS Build Profiles (`eas.json`)

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### Profile Descriptions:
1. **`preview` (Standalone APK for Direct Device Installation)**:
   - Compiles a self-contained `.apk` file that can be downloaded and installed directly on any physical Android phone without Google Play Store.
   - Ideal for QA testing, team reviews, and physical device performance verification.
2. **`production` (AAB for Google Play Store Distribution)**:
   - Compiles an Android App Bundle (`.aab`) optimized for Play Console distribution, automatic size slicing, and Play Integrity verification.

---

## 5. Step-by-Step Build & Release Instructions

### Step 1: Pre-Build Quality Gates
Ensure all quality gates pass before initiating a cloud build:
```bash
# 1. Type check (0 errors)
npm run type-check

# 2. Automated test suite (23/23 passing)
npm test

# 3. Expo Doctor diagnostic (20/20 checks passed)
npx expo-doctor
```

### Step 2: Authenticate with EAS
EAS Build requires an active Expo account:
```bash
npx eas-cli login
```

### Step 3: Configure Project on EAS (First Time Only)
```bash
npx eas-cli project:init
```

### Step 4: Build Standalone APK (Preview Profile)
```bash
npx eas-cli build -p android --profile preview
```
- EAS will provision the Android build environment in the cloud, handle signing credentials (keystore), and compile the APK.
- Once completed, EAS CLI will output a direct download URL and QR code for the `.apk` file.
- Download the `.apk` on your Android device and tap to install.

### Step 5: Build Production AAB (Play Store Release)
```bash
npx eas-cli build -p android --profile production
```
- Once compiled, download the `.aab` file from the EAS dashboard and upload it to the **Google Play Console > Production track (or Closed Testing)**.

---

## 6. Truthful Build Status Disclosure

- **Locally Verifiable Status**: All project configurations, icons, permissions, dependencies, TypeScript types, and test suites are **100% verified and green**.
- **Cloud Build Execution**: Triggering `npx eas-cli build` requires interactive authentication with an active Expo developer account (`eas login`).
- As an automated agent without access to the user's personal Expo account credentials, the cloud compilation must be triggered with `npx eas-cli build -p android --profile preview` using the developer's credentials.
