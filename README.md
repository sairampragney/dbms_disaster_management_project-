# Disaster Alert & Community Response

> Modern, secure, India-focused disaster alert and community response web platform.

---

## Overview

**Disaster Alert & Community Response** is a dedicated disaster management technology platform tailored specifically for India (demonstration centered on **Hyderabad, Telangana**). It empowers citizens to view real-time disaster alerts, report local emergency incidents, request emergency aid, locate open safe locations/shelters, and participate in coordinated volunteer responses.

---

## Key Features Implemented (Phases 1 - 9)

- **Phase 1 (Foundation):** React + Vite + TypeScript, React Router, Tailwind CSS design system, and initial Firebase SDK integration configured for project `disaster-management-syst-ca22d` and Local Emulator Suite.
- **Phase 2 (Authentication):** Firebase Authentication with Email/Password, persistence, profile synchronization (`users/{uid}`), protected routes, password reset, and registration role locking (`CITIZEN`).
- **Phase 3 (Roles & Security):** Role-based access control (`CITIZEN`, `VOLUNTEER`, `ADMIN`), secure admin bootstrap mechanism, and production-grade Firestore Security Rules enforcing strict ownership, active status checks, and field mutability locks.
- **Phase 4 (Disaster Alerts):** Public alerts list and detail views (`/alerts`, `/alerts/:alertId`), Admin alert management dashboard (`/admin/alerts`), severity badges, disaster category filters, and Call 112 emergency CTA integration.
- **Phase 5 (Incident Reporting):** Citizen incident reporting form (`/incidents/report`), personal incident tracking (`/my-incidents`), incident detail page (`/incidents/:incidentId`), Admin incident verification dashboard (`/admin/incidents`), Admin verification & resolution details (`/admin/incidents/:incidentId`), and strict Firestore security rules protecting reporter identity, status transitions (`REPORTED` -> `VERIFIED` -> `IN_PROGRESS` -> `RESOLVED` / `DISMISSED`), and verification metadata.
- **Phase 6 (Emergency Requests):** Citizen emergency request form (`/emergency-requests/new`), personal emergency assistance tracking (`/my-emergency-requests`), request detail view (`/emergency-requests/:requestId`), citizen cancellation rules (`PENDING`/`ACKNOWLEDGED` -> `CANCELLED`), Admin emergency request queue (`/admin/emergency-requests`), Admin detail management & volunteer assignment (`/admin/emergency-requests/:requestId`), and strict Firestore security rules protecting requester ownership, status workflow (`PENDING` -> `ACKNOWLEDGED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED`), and volunteer assignment locks.
- **Phase 7 (Safe Locations):** Public/citizen safe locations directory (`/safe-locations`), location detail view (`/safe-locations/:locationId`), Google Maps directions URL builder, emergency service badges, Admin safe location management portal (`/admin/safe-locations`), Admin creation and editing (`/admin/safe-locations/:locationId`), soft deactivation/reactivation (`isActive`), and strict Firestore security rules protecting inactive records and administrative fields (`createdBy`, `createdAt`).
- **Phase 8 (Volunteers & Community Response):** Citizen volunteer registration application (`/volunteer/apply`), volunteer command dashboard (`/volunteer/dashboard`), volunteer profile management (`/volunteer/profile`), volunteer task assignment dispatch feed (`/volunteer/tasks`), task acceptance/rejection/start response controls (`/volunteer/tasks/:requestId`), Admin volunteer management registry (`/admin/volunteers`), Admin review and verification approval/suspension (`/admin/volunteers/:uid`), and strict Firestore Security Rules enforcing `isApprovedVolunteer` checks, self-application default locking (`PENDING`, `isActive: false`), assigned task protection, and immutable verification fields.
- **Phase 9 (Dashboards & Notifications):** Citizen landing command center (`/dashboard`), Volunteer command portal metrics, Admin executive operational overview (`/admin/dashboard`), in-app Notification Center (`/notifications`), notification details with related-entity navigation (`/notifications/:notificationId`), Admin notification composer (`/admin/notifications`), and strict Firestore Security Rules protecting notification recipient ownership, read-state updates (`isRead`, `readAt`), and immutable notification content fields (`recipientId`, `title`, `message`, `createdBy`, `createdAt`, `priority`).

---

## Architectural Constraint Notice (Client-Only Architecture)

> **Notice:** This Firebase client-only architecture does not provide a trusted server-side notification fan-out mechanism. Phase 9 therefore uses secure recipient-owned notifications and admin-authored notifications rather than allowing arbitrary client-side cross-user notification creation.

---

## Core Technology Stack

- **Frontend:** React 18, Vite, TypeScript, React Router v6, Tailwind CSS, Lucide React Icons
- **Backend / BaaS:** Firebase Authentication, Cloud Firestore
- **Local Development:** Firebase Local Emulator Suite (Authentication & Firestore)
- **Deployment:** Firebase Hosting

---

## Local Development & Setup

### Prerequisites

- Node.js (v18 or v20 recommended)
- Java Runtime Environment (JRE 11+) for Firebase Local Emulator Suite

### Installation

```bash
# 1. Clone repository
git clone https://github.com/sairampragney/dbms_disaster_management_project.git
cd dbms_disaster_management_project

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

### Development Commands

```bash
# Start Vite development server
npm run dev

# Run unit and security rule tests
npm test

# Run tests without parallelism for emulator security tests
npx vitest run --fileParallelism=false

# Start Firebase Local Emulators
npm run emulators
```

---

## Firestore Data Model Summary

| Collection | Description |
| --- | --- |
| `users/{uid}` | User profiles containing contact details, Indian address fields, and role (`CITIZEN`, `VOLUNTEER`, `ADMIN`). |
| `alerts/{alertId}` | Disaster advisories published by administrators. |
| `incidents/{incidentId}` | Incident reports submitted by citizens with verification status (`REPORTED`, `VERIFIED`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED`). |
| `emergencyRequests/{requestId}` | Assistance requests logged by citizens with priority, assigned volunteer UID, and lifecycle (`PENDING` -> `ACKNOWLEDGED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` / `CANCELLED`). |
| `safeLocations/{locationId}` | Evacuation centers, shelters, hospitals, police/fire stations with availability (`AVAILABLE`, `LIMITED`, `FULL`, `CLOSED`), services, and capacity. |
| `volunteers/{uid}` | Volunteer profiles with skills, availability (`AVAILABLE`, `BUSY`, `UNAVAILABLE`), verification status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`), and active state. |
| `responses/{responseId}` | Volunteer assignments connecting responders to emergency requests. |
| `notifications/{notificationId}` | Targeted emergency notifications with recipient ownership, read-state timestamps, priority, and entity navigation pointers. |
| `auditLogs/{logId}` | Administrative action logs for security auditing. |

---

## Emergency Information

- **Primary Nationwide Emergency CTA:** Call **112** (`<a href="tel:112">Call 112</a>`)
- **Police:** 100
- **Fire:** 101
- **Ambulance:** 108

> **Disclaimer:** Disaster Alert & Community Response is an independent technology platform and not an official government service. For immediate life-threatening emergencies, call **112**.
