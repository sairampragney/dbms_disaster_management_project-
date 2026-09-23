# Product Requirement Document (PRD)
## Project Name: Disaster Alert & Community Response

---

## 1. Vision & Executive Summary
The **Disaster Alert & Community Response** platform is a modern, secure, India-first web application designed to streamline real-time disaster alerts, incident reporting, emergency assistance requests, safe location discovery, and coordinated community response. Built specifically for the Indian context, the system serves Citizens, Volunteers, and Administrators with high reliability, strict role-based access control, and intuitive emergency workflows.

*Note: This platform is an independent technology platform and not an official government service.*

---

## 2. Problem Statement
During natural or man-made disasters in India (floods, cyclones, heatwaves, landslides, earthquakes), citizens face critical delays in receiving actionable alerts, reporting localized emergency incidents, requesting life-saving assistance (food, water, medical, evacuation), and identifying safe shelter locations. Existing platforms often lack localization, clear operational roles, secure security rules, or effective volunteer dispatching mechanisms.

---

## 3. Target Users & Personas

### 3.1 Citizen (General Public)
- **Need:** Receive verified emergency alerts, report local incidents, request urgent aid, find open shelters, track status of submitted requests.
- **Constraints:** May be on low-bandwidth mobile networks, experiencing high stress, requiring simple and fast interfaces.

### 3.2 Volunteer
- **Need:** Register skills and availability, view assigned emergency requests, accept tasks, update operational response status, coordinate ground help.
- **Constraints:** Needs clear task details, contact details, and streamlined status tracking.

### 3.3 Administrator (Disaster Response Coordinator)
- **Need:** Issue and manage public disaster alerts, verify reported incidents, allocate/assign volunteers to requests, manage safe location capacities, audit user roles and system operations.
- **Constraints:** Requires a clear high-level dashboard and strict auditing to prevent unauthorized modifications or panic.

---

## 4. Goals & Non-Goals

### Goals
- Real-time dissemination of disaster alerts filtered by region, severity, and disaster type.
- Simplified incident reporting and emergency request submissions.
- Real-time tracking of safe locations with capacity and occupancy management.
- Volunteer management with status tracking (AVAILABLE, BUSY, UNAVAILABLE).
- Role-based security enforced via Firestore Security Rules.
- Dedicated support for local development using Firebase Local Emulator Suite.

### Non-Goals
- Traditional backend server (Express/Node/SQL) — all logic is client-side + Firebase Auth + Firestore + Storage.
- Automatic integration with official emergency dispatch software (Call 112 CTA provided for direct dialing).
- US-centric concepts, emergency numbers (911), or non-Indian geographic defaults.

---

## 5. Roles & Permissions Matrix

| Feature / Action | Anonymous | Citizen | Volunteer | Admin |
| :--- | :---: | :---: | :---: | :---: |
| View Public Alerts & Safe Locations | ✅ | ✅ | ✅ | ✅ |
| Register as Citizen | ✅ | ✅ | ✅ | ✅ |
| Submit Incident / Emergency Request | ❌ | ✅ | ✅ | ✅ |
| Track Own Incidents / Requests | ❌ | ✅ | ✅ | ✅ |
| Update Volunteer Profile & Status | ❌ | ❌ | ✅ | ✅ |
| Accept / Manage Response Tasks | ❌ | ❌ | ✅ | ✅ |
| Manage Alerts (Create/Edit/Expire) | ❌ | ❌ | ❌ | ✅ |
| Verify Incidents & Approve Volunteers| ❌ | ❌ | ❌ | ✅ |
| Manage Safe Locations & Capacity | ❌ | ❌ | ❌ | ✅ |
| Manage User Roles & View Audit Logs | ❌ | ❌ | ❌ | ✅ |

---

## 6. Functional Requirements

### 6.1 Authentication & User Management
- Public registration defaults strictly to `CITIZEN`.
- Email & password authentication via Firebase Auth.
- Admin role assigned only via controlled bootstrap or existing admin grant.
- User profile storing phone (+91 format), city, district, state, PIN code.

### 6.2 Public Alerts
- Severities: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Statuses: `ACTIVE`, `RESOLVED`, `EXPIRED`.
- Indian disaster types: Flood, Urban Flooding, Cyclone, Heavy Rainfall, Heatwave, Landslide, Earthquake, Drought, Lightning, Fire, Other.

### 6.3 Incident Reporting
- Report fields: Disaster type, description, location details, city, district, state, severity, optional photo attachment.
- Workflow: `REPORTED` -> `VERIFIED` -> `IN_PROGRESS` -> `RESOLVED` (or `DISMISSED`).

### 6.4 Emergency Requests
- Categories: Medical, Food, Water, Evacuation, Shelter, Rescue, Other.
- Priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
- Workflow: `PENDING` -> `ACKNOWLEDGED` -> `ASSIGNED` -> `IN_PROGRESS` -> `FULFILLED` (or `CANCELLED` / `REJECTED`).
- Duplicate submission prevention.

### 6.5 Safe Locations
- Attributes: Name, Type (Shelter, Hospital, Relief Camp), Address, City, District, State, PIN Code, Capacity, Current Occupancy, Status (`OPEN`, `FULL`, `CLOSED`), Contact phone.
- Capacity invariant: $0 \le \text{currentOccupancy} \le \text{capacity}$.

### 6.6 Volunteer & Community Response
- Volunteer registration requires background skills, city/district, phone, and admin verification.
- Availability states: `AVAILABLE`, `BUSY`, `UNAVAILABLE`.
- Task response tracking: `ASSIGNED` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`.

### 6.7 Admin & Audit Logging
- Complete operational dashboard for active alerts, pending incidents, pending requests, volunteer availability, and shelter capacities.
- Audit log records for all administrative mutations (`ALERT_CREATED`, `INCIDENT_VERIFIED`, `VOLUNTEER_APPROVED`, `ROLE_CHANGED`, etc.).

---

## 7. Non-Functional Requirements & Security
- **Design System:** Clean white + blue primary theme, responsive across 360px to 1440px devices, strong visual hierarchy, accessible contrast and semantic ARIA elements.
- **Security Boundary:** Firestore Security Rules enforce authentication, ownership, role checks, and field integrity. No client-driven role escalation.
- **Performance:** Optimized Firestore queries, index definitions, and minimal unnecessary real-time listeners.

---

## 8. India Localization Standards
- Primary Emergency Number: **112** (Main CTA: Call 112 via `<a href="tel:112">`).
- Auxiliary Emergency Numbers: Police (100), Fire (101), Ambulance (108).
- Phone Format: `+91 98765 43210`.
- Address Format: House/Flat, Street/Area, Locality, City, District, State, PIN Code, India.
- Default Demonstration Geography: **Hyderabad, Telangana** (with top Indian cities/districts).
- Date & Timezone: `DD/MM/YYYY`, `Asia/Kolkata`.
- Currency: `₹` / `INR`.

---

## 9. Phased Implementation Roadmap
- **Phase 1:** Project setup, Vite + React + TS, React Router, base design system, Firebase SDK configuration, documentation, Firebase CLI & Emulator setup.
- **Phase 2:** Firebase Authentication & User Profiles.
- **Phase 3:** User Roles & Firestore Security Rules.
- **Phase 4:** Disaster Alerts Management & Public Feed.
- **Phase 5:** Incident Reporting & Verification Workflow.
- **Phase 6:** Emergency Requests & Citizen Tracking.
- **Phase 7:** Safe Locations & Capacity Management.
- **Phase 8:** Volunteers & Community Response Workflow.
- **Phase 9:** Role Dashboards & In-App Notifications.
- **Phase 10:** India Localization Comprehensive Audit.
- **Phase 11:** Automated Testing (Unit, Integration, Security Rules, E2E).
- **Phase 12:** Firebase Production Deployment.
- **Phase 13:** Final Production Verification.
