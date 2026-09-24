# Architecture Specification
## Project: Disaster Alert & Community Response

---

## 1. Architecture Overview

The **Disaster Alert & Community Response** application is built as a serverless Single Page Application (SPA) leveraging **React 18+**, **TypeScript**, **Vite**, **React Router v6**, and the **Firebase Ecosystem** (Firebase Auth, Cloud Firestore, Firebase Hosting, optional Firebase Storage).

There is **no traditional Express/Node backend server or relational database**. All business rules, access controls, data queries, and persistence are driven by client-side application logic coupled with declarative **Firestore Security Rules** and Firebase Auth token claims / user documents.

---

## 2. Environment Setup & Data Flow

### 2.1 Production Topology
```text
                     User Browser (Desktop/Mobile)
                                  │
                                  ▼
                        Firebase Hosting (CDN)
                         (Single Page App SPA)
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
 Firebase Auth             Cloud Firestore          Firebase Storage (Optional)
 (User Tokens & Roles)  (Realtime & Indexed Data)     (Incident Photo Media)
```

### 2.2 Local Development Topology
```text
                     Local Browser (localhost:5173)
                                  │
                                  ▼
                      Vite Dev Server (HMR)
                                  │
                                  ▼
                   Firebase Local Emulator Suite
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
 Auth Emulator            Firestore Emulator         Storage Emulator
 (Port 9099)               (Port 8080)               (Port 9199)
```

Environment switching is managed seamlessly via environment variables (`VITE_USE_FIREBASE_EMULATOR=true`) in `src/config/firebase.ts`.

---

## 3. Firestore Data Model Specification

Top-level collections:

### 3.1 `users/{uid}`
```typescript
interface UserDocument {
  uid: string;
  fullName: string;
  email: string;
  phone: string; // +91 format
  role: 'CITIZEN' | 'VOLUNTEER' | 'ADMIN';
  city: string;
  district: string;
  state: string;
  pincode: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.2 `alerts/{alertId}`
```typescript
interface AlertDocument {
  id: string;
  title: string;
  description: string;
  disasterType: 'Flood' | 'Urban Flooding' | 'Cyclone' | 'Heavy Rainfall' | 'Heatwave' | 'Landslide' | 'Earthquake' | 'Drought' | 'Lightning' | 'Fire' | 'Other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedArea: string;
  city: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  createdBy: string; // UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
  isPublic: boolean;
  recommendedAction: string;
}
```

### 3.3 `incidents/{incidentId}`
```typescript
interface IncidentDocument {
  id: string;
  reporterId: string; // UID
  title: string;
  description: string;
  incidentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  city: string;
  district: string;
  state: string;
  photoUrl?: string;
  status: 'REPORTED' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verifiedBy?: string; // Admin UID
  verifiedAt?: Timestamp;
}
```

### 3.4 `emergencyRequests/{requestId}`
```typescript
interface EmergencyRequestDocument {
  id: string;
  requesterId: string; // UID
  requestType: 'Medical' | 'Food' | 'Water' | 'Evacuation' | 'Shelter' | 'Rescue' | 'Other';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  location: string;
  city: string;
  district: string;
  state: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'FULFILLED' | 'CANCELLED' | 'REJECTED';
  assignedVolunteerId?: string; // Volunteer UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.5 `safeLocations/{locationId}`
```typescript
interface SafeLocationDocument {
  id: string;
  name: string;
  type: 'Relief Camp' | 'Hospital' | 'Shelter' | 'Community Center' | 'Other';
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number; // Enforced 0 <= currentOccupancy <= capacity
  status: 'OPEN' | 'FULL' | 'CLOSED';
  contact: string; // Phone
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.6 `volunteers/{uid}`
```typescript
interface VolunteerDocument {
  userId: string; // UID matching users collection
  skills: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  phone: string;
  city: string;
  district: string;
  state: string;
  verified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.7 `responses/{responseId}`
```typescript
interface CommunityResponseDocument {
  id: string;
  requestId: string;
  volunteerId: string;
  status: 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  notes?: string;
  assignedAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

### 3.8 `notifications/{notificationId}`
```typescript
interface NotificationDocument {
  id: string;
  recipientUid: string; // UID or 'PUBLIC' / 'VOLUNTEERS' / 'ADMINS'
  title: string;
  message: string;
  type: 'ALERT' | 'INCIDENT_UPDATE' | 'REQUEST_UPDATE' | 'ASSIGNMENT';
  link?: string;
  read: boolean;
  createdAt: Timestamp;
}
```

### 3.9 `auditLogs/{logId}`
```typescript
interface AuditLogDocument {
  id: string;
  actorUid: string;
  action: string; // e.g. 'ALERT_CREATED', 'ROLE_CHANGED'
  entity: string; // e.g. 'alerts', 'users'
  entityId: string;
  timestamp: Timestamp;
  summary: string;
}
```

---

## 4. Security Architecture & Rules

Security boundaries are strictly enforced in `firestore.rules`:

1. **Authentication Guard:** Unauthenticated users can only read public alerts and safe locations.
2. **Role Verification:** User roles (`CITIZEN`, `VOLUNTEER`, `ADMIN`) are loaded from `users/$(request.auth.uid)`.
3. **Role Escalation Defense:** Normal registration sets `role: 'CITIZEN'`. Clients cannot update the `role` field on `users/{uid}` unless `request.auth` has an `ADMIN` role.
4. **Ownership Restriction:** Users can only modify their own profile, incident reports, and emergency requests (and only while in mutable initial states).
5. **Admin Authorization:** Administrative operations (alert creation, volunteer approval, status updates to protected workflow states) require `isAdmin()`.
6. **Field Integrity Validation:** Firestore rules assert invariants such as `currentOccupancy >= 0` and `currentOccupancy <= capacity`.

---

## 5. Client Routing Strategy (SPA)

Firebase Hosting serves `dist/index.html` for all unknown routes via rewrite config:
```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

Routes in React Router v6:
- `/` - Home Page
- `/about` - About & Emergency Context
- `/alerts` - Public Alerts Feed
- `/safe-locations` - Safe Locations Directory
- `/emergency` - Rapid Emergency Assistance Hub (Call 112 CTA)
- `/login` - Authentication Login
- `/register` - Public Citizen Registration
- `/dashboard` - Citizen Personal Dashboard
- `/profile` - User Profile Management
- `/my-incidents` - User Incident History
- `/my-requests` - User Emergency Requests History
- `/notifications` - User In-App Notifications
- `/volunteer` - Volunteer Operations & Profile
- `/responses` - Volunteer Active Assignments
- `/admin/*` - Admin Control Center (Alerts, Incidents, Requests, Volunteers, Shelters, Users, Audit Logs)

---

## 6. Local Development & Firebase Emulators Configuration

Local developers configure `.env.local` or environment variables:
```env
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=disaster-management-syst-ca22d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=disaster-management-syst-ca22d
VITE_FIREBASE_STORAGE_BUCKET=disaster-management-syst-ca22d.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:1234567890
VITE_USE_FIREBASE_EMULATOR=true
```

Running emulators:
```bash
npx firebase emulators:start --only auth,firestore,hosting
```
