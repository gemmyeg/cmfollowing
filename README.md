# Car Maintenance · صيانة السيارات

A mobile app (Android and iOS) to profile cars and their owners, follow each car's
maintenance schedule, and get notified when an item is due. Arabic and English.

## Features

- **Accounts**: email/password or Gmail. Roles: an **admin** sees and manages every car and has a
  dashboard; a **user** only sees the cars assigned to them.
- **Cars**: car and owner profile with a photo, assigned to one or more users.
- **Recommended maintenance**: 17 built-in items with typical km and/or month intervals, editable
  per car, plus custom items. Each item shows OK / due soon / overdue.
- **Reminders**: km per day is estimated from the odometer readings to predict each due date.
  Notifications a week before, on the due day, every morning while overdue, and a weekly nudge to
  update the mileage.
- **Service log**: photograph the odometer (the km is read on the device), tick what was done, and
  add the cost of each item in EGP, notes and photos. History per car.
- **Dashboard** (admin): cars needing service, overdue and due-soon items, money spent this month and year.
- Arabic and English, right-to-left aware.

Photos are shrunk and stored in Firestore, so the free Firebase (Spark) plan is enough.

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

Gmail sign-in and reading the odometer from a photo need a development build (they do not work
inside Expo Go). Everything else works in Expo Go; there you type the km by hand.

### 3. Make yourself admin

Sign up once in the app, then in **Firestore > users > (your uid)** change `role` from `user` to `admin`.
The security rules stop anyone from making themselves admin from the app.

## Run

```bash
npm install
npm start             # opens in Expo Go: scan the QR code with it
npm run tunnel        # same, when the phone can't reach the PC on Wi-Fi (needs `npx expo login`
                      # or EXPO_TOKEN, and the same account signed in to Expo Go)
npx tsc --noEmit      # typecheck
```

Installable build (needed for Gmail sign-in and odometer reading). Needs a free Expo account:

```bash
npx eas-cli@latest build --profile development --platform android   # for developing
npx eas-cli@latest build --profile preview --platform android       # an APK to share with family
```
