# Firebase Production Deployment Guide

This guide details the deployment procedures for the **Disaster Alert & Community Response** application (`disaster-management-syst-ca22d`).

---

## Target Project Context

- **Firebase Project ID**: `disaster-management-syst-ca22d`
- **Hosting URL**: `https://disaster-management-syst-ca22d.web.app` (and `https://disaster-management-syst-ca22d.firebaseapp.com`)
- **Services Used**: Firebase Authentication, Cloud Firestore, Firebase Hosting, Firebase Local Emulator Suite
- **Source Control**: [GitHub Repository](https://github.com/sairampragney/dbms_disaster_management_project)

---

## 1. Local Emulator Development

To test the complete platform locally without mutating production Firebase data:

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Start Firebase Emulators (Auth on 9099, Firestore on 8080, Hosting on 5000, UI on 4000)
npm run emulators

# 4. Alternatively, execute vitest security tests against emulators
npx firebase-tools emulators:exec "npx vitest run --fileParallelism=false"
```

---

## 2. Production Firebase Deployment

Deployment is performed manually via the Firebase CLI from the `main` branch.

### Prerequisites

1. Ensure Node.js (v18+) and Java Runtime Environment (JRE 11+) are installed.
2. Authenticate with the Firebase CLI:
   ```bash
   firebase login
   ```
3. Confirm project targeting:
   ```bash
   firebase use disaster-management-syst-ca22d
   ```

### Production Deployment Command

```bash
# 1. Install fresh dependencies
npm install

# 2. Compile TypeScript and build production bundle
npm run build

# 3. Deploy Firestore Security Rules, Indexes, and Hosting
firebase deploy --only firestore,hosting
```

---

## 3. Post-Deployment Verification Checklist

1. **Hosting & SPA Navigation**: Visit `https://disaster-management-syst-ca22d.web.app` and refresh deep routes (`/alerts`, `/incidents/report`, `/emergency-requests/new`, `/safe-locations`, `/volunteer/dashboard`, `/admin/dashboard`, `/notifications`) to confirm single-page application routing.
2. **Firestore Security Rules**: Confirm that `firestore.rules` and `firestore.indexes.json` are active in the Firebase Console.
3. **Authentication**: Verify Email/Password sign-up (strictly assigning `CITIZEN` role), login, and password reset.
4. **India Localization**: Verify `Call 112` CTAs, 6-digit `PIN Code` inputs, `+91` phone formatting, and `DD/MM/YYYY` date formatting across all screens.

---

## 4. Rollback Procedure

If a deployment needs to be reverted:

1. Open the [Firebase Console](https://console.firebase.google.com/project/disaster-management-syst-ca22d/hosting/sites).
2. Go to **Hosting** -> **Release History**.
3. Select the previous stable release and click **Rollback**.
