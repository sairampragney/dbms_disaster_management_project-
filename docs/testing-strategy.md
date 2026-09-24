# Testing Strategy & Inventory

This document outlines the testing methodology, tools, test inventory, and execution procedures for the **Disaster Alert & Community Response** platform (`disaster-management-syst-ca22d`).

---

## 1. Testing Methodology & Stack

The platform utilizes a multi-layered testing strategy combining unit validation, service logic verification, and Firestore Security Rule authorization testing against the **Firebase Local Emulator Suite**:

- **Test Runner**: [Vitest v1.6.1](https://vitest.dev)
- **Security Rule Testing**: `@firebase/rules-unit-testing` v3
- **Environment**: Node.js (v18 / v20) with Firebase Local Emulator Suite (Firestore on port 8080, Auth on port 9099, Hosting on port 5000)
- **Parallelism Control**: `--fileParallelism=false` is enforced when executing security tests to ensure isolated state across sequential emulator transactions.

---

## 2. Test Inventory & Coverage Map

| Test Suite File | Category | Test Cases | Description |
| --- | --- | --- | --- |
| `src/test/auth-validation.test.ts` | Unit | 5 | Validates email syntax, password strength, PIN Code format (6-digit Indian standard), and phone number format. |
| `src/test/alerts.test.ts` | Service Unit | 3 | Validates disaster alert input transformation, filtering parameters, and severity badge helpers. |
| `src/test/incidents.test.ts` | Service Unit | 2 | Validates incident creation payload formatting and status label helpers. |
| `src/test/emergency-requests.test.ts` | Service Unit | 2 | Validates emergency request payload formatting and priority level helpers. |
| `src/test/safe-locations.test.ts` | Service Unit | 3 | Validates safe location coordinates validation, service options, and Google Maps directions URL generation. |
| `src/test/volunteers.test.ts` | Service Unit | 2 | Validates volunteer skill option parsing and availability badge styling helpers. |
| `src/test/notifications.test.ts` | Service Unit | 2 | Validates notification type navigation mapping and priority badge helpers. |
| `src/test/security-rules.test.ts` | Security / Rules | 9 | Tests `users` collection authorization, anonymous rejection, self-profile edits, and role escalation locks (`role: CITIZEN`). |
| `src/test/alert-security.test.ts` | Security / Rules | 6 | Tests `alerts` collection rules: public read for active advisories, admin-only creation/edits, and citizen/volunteer edit denials. |
| `src/test/incident-security.test.ts` | Security / Rules | 10 | Tests `incidents` collection rules: reporter ownership, IDOR prevention, status transition locks, and admin verification rights. |
| `src/test/emergency-request-security.test.ts` | Security / Rules | 12 | Tests `emergencyRequests` collection rules: requester ownership, citizen cancellation, volunteer assignment locks, and admin queue access. |
| `src/test/safe-location-security.test.ts` | Security / Rules | 12 | Tests `safeLocations` collection rules: public read for active records (`isActive == true`), private inactive protection, and admin creation/edits. |
| `src/test/volunteer-security.test.ts` | Security / Rules | 18 | Tests `volunteers` collection rules: `isApprovedVolunteer` helper, self-application locks (`PENDING`, `isActive: false`), task dispatch rights, and admin approval locks. |
| `src/test/notification-security.test.ts` | Security / Rules | 13 | Tests `notifications` collection rules: recipient ownership, read-state updates (`isRead`, `readAt`), immutable notification content fields, and admin composer rights. |

**Total Inventory**: 14 Test Suite Files, **99 Test Cases**.

---

## 3. How to Run Tests

### Standard Execution (Requires Running Emulators)

```bash
# Terminal 1: Start Firebase Emulators
npm run emulators

# Terminal 2: Execute Vitest
npx vitest run --fileParallelism=false
```

### Single-Command Emulator Execution

```bash
npx firebase-tools emulators:exec "npx vitest run --fileParallelism=false"
```

---

## 4. Emulator & Testing Requirements

1. **Java Runtime**: Java 11 or higher is required for the Firestore Emulator.
2. **Ports**: Ensure ports `8080` (Firestore), `9099` (Auth), `5000` (Hosting), and `4000` (Emulator UI) are unblocked.
3. **No Production Mutation**: All security rule tests execute against emulated Firestore contexts initialized via `initializeTestEnvironment()`. Zero production data is modified.
