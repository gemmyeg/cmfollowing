# Car Maintenance · صيانة السيارات

A mobile app (Android and iOS) to profile cars and their owners, follow each car's
maintenance schedule, and get notified when an item is due. Arabic and English.

## Features (planned)

1. **Foundation** (done): accounts (email/password and Gmail), admin/user roles, Arabic and English with RTL.
2. **Cars**: car and owner profile, editable maintenance items with a lifetime in km and/or months,
   cars assigned to users. Admins see every car and a dashboard; users only see their assigned cars.
3. **Notifications**: predicted due dates from the car's average daily km.
4. **Service log**: photograph the odometer to update the km, tick the items done, with the cost of
   each item in EGP and notes.

## Setup

### 1. Firebase

1. Project: `vmfollowing` at <https://console.firebase.google.com/project/vmfollowing>.
2. **Authentication > Sign-in method**: enable **Email/Password** and **Google**.
3. **Firestore Database**: create a database, then paste `firestore.rules` into the **Rules** tab and publish.
4. The app is already configured for the `vmfollowing` project (`src/lib/firebase.ts`). To use another
   project, copy `.env.example` to `.env` and fill in the `EXPO_PUBLIC_FIREBASE_*` values.

### 2. Gmail sign-in

In <https://console.cloud.google.com> (same project) > **APIs & Services > Credentials**, the web
client id already exists (Firebase made it). Create an **Android** and an **iOS** OAuth client id using
the bundle id `com.gemmyeg.carmaintenance`, and fill in the `EXPO_PUBLIC_GOOGLE_*` values in `.env`.

Gmail sign-in needs a development build (it does not work inside Expo Go). Email/password works in Expo Go.

### 3. Make yourself admin

Sign up once in the app, then in **Firestore > users > (your uid)** change `role` from `user` to `admin`.
The security rules stop anyone from making themselves admin from the app.

## Run

```bash
npm install
npx expo start        # scan the QR code with Expo Go
npx tsc --noEmit      # typecheck
```

Development build (needed for Gmail sign-in and background notifications):

```bash
npx eas-cli@latest build --profile development --platform android
```
