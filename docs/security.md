# Security & Authorization Model

This document outlines the security strategy, role permissions matrix, Firestore Security Rules implementation, privilege escalation defenses, and administrator bootstrap procedure for the **Disaster Alert & Community Response** application.

---

## 1. Role Permissions Matrix

The platform enforces three distinct roles across the client and database boundaries:

| Action / Resource | Anonymous | CITIZEN | VOLUNTEER | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| View Public Alerts & Safe Locations | ✅ | ✅ | ✅ | ✅ |
| Register as Citizen | ✅ | ✅ | ✅ | ✅ |
| Read Own User Profile | ❌ | ✅ | ✅ | ✅ |
| Read Other User Profiles | ❌ | ❌ | ❌ | ✅ |
| Update Allowed Profile Fields (`phone`, `city`, `pincode`) | ❌ | ✅ | ✅ | ✅ |
| Update Protected Profile Fields (`role`, `uid`, `isActive`) | ❌ | ❌ | ❌ | ✅ |
| Submit Disaster Incidents & Requests (Phases 5-6) | ❌ | ✅ | ✅ | ✅ |
| Accept Response Tasks & Set Availability (Phase 8) | ❌ | ❌ | ✅ | ✅ |
| Manage Alerts, Shelters & Audit Logs (Phases 4, 7, 9) | ❌ | ❌ | ❌ | ✅ |

---

## 2. Firestore Security Rules Strategy (`firestore.rules`)

Security is enforced at the database layer using **Firestore Security Rules (version 2)**. Rules validate authentication tokens, document ownership (`request.auth.uid == userId`), and field-level diffs (`!request.resource.data.diff(resource.data).affectedKeys().hasAny([...])`).

### Helper Functions

```playground
function isSignedIn() {
  return request.auth != null;
}

function getUserData() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
}

function isActiveUser() {
  return isSignedIn() &&
    exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
    getUserData().get('isActive', true) == true;
}

function isOwner(userId) {
  return isSignedIn() && request.auth.uid == userId;
}

function getUserRole() {
  return getUserData().get('role', 'CITIZEN');
}

function isAdmin() {
  return isActiveUser() && getUserRole() == 'ADMIN';
}
```

---

## 3. Privilege Escalation & IDOR Defenses

1. **Client Role Selection Blocking:** Public registration forms do not accept a `role` input and hardcode `role: 'CITIZEN'` on creation.
2. **Field-Level Mutation Defense:** When a user updates their profile document `users/{uid}`, Firestore rules assert that `role`, `uid`, `isActive`, and `createdAt` are not present in `affectedKeys()`.
3. **Inactivity Enforcement:** If an administrator sets `isActive: false` on a user profile, all subsequent `isActiveUser()` helper evaluations evaluate to `false`, revoking access across all authenticated routes and database endpoints.
4. **Ownership Boundary (IDOR):** Citizens can read and write only documents matching `users/$(request.auth.uid)`. Reading or writing another citizen's profile is strictly denied.

---

## 4. Controlled Administrator Bootstrap Procedure

There is **no public registration endpoint** for administrators. Initial system administrator creation follows this controlled procedure:

### Step 1: Create Normal Firebase Auth Account
Register a normal user account via the registration interface or Firebase Auth Console (e.g., `admin@disasterresponse.in`). Note the generated `UID`.

### Step 2: Assign Initial Admin Role in Firestore
Using either:
- **Firebase Console:** Navigate to Cloud Firestore -> `users/{uid}`, update the `role` field from `"CITIZEN"` to `"ADMIN"`.
- **Firebase CLI / Admin SDK Script:**

```javascript
// admin-bootstrap.js (Executed via Node Admin SDK locally)
const admin = require('firebase-admin');
admin.initializeApp();

async function promoteToAdmin(uid) {
  await admin.firestore().collection('users').doc(uid).update({
    role: 'ADMIN',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`User ${uid} successfully promoted to ADMIN.`);
}

promoteToAdmin('TARGET_USER_UID');
```

---

## 5. Security Rules Testing Suite

Automated security rules testing is implemented in `src/test/security-rules.test.ts` using `@firebase/rules-unit-testing` and run against the local Firestore Emulator:

```bash
npx firebase emulators:exec --only firestore "npm test"
```

Tested Scenarios:
- Anonymous access denial.
- Citizen read/write ownership verification.
- IDOR prevention (Citizen A attempting to read/write Citizen B).
- Privilege escalation attempts (mutating `role` to `ADMIN`).
- Protected field mutation denial (`uid`, `isActive`).
- Admin override permissions.
