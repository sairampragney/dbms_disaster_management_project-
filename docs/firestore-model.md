# Cloud Firestore Schema & Data Model Specification

This document details the complete Cloud Firestore database schema for the **Disaster Alert & Community Response** application.

---

## 1. Collections Overview

```text
users/{uid}                    - Authenticated user profiles & roles
alerts/{alertId}               - Disaster warnings & advisories
incidents/{incidentId}         - Public citizen disaster incident reports
emergencyRequests/{requestId}  - Emergency assistance requests (food, water, medical)
safeLocations/{locationId}     - Relief shelters, camps, & hospitals
volunteers/{uid}               - Registered volunteer availability & skills
responses/{responseId}         - Volunteer task response assignments
notifications/{notificationId} - User in-app notifications
auditLogs/{logId}              - Administrative operation audit trails
```

---

## 2. Collection Schemas

### 2.1 `users/{uid}`
```typescript
interface UserDocument {
  uid: string;              // Firebase Auth UID
  fullName: string;         // e.g. "Ramesh Kumar"
  email: string;            // e.g. "ramesh@example.in"
  phone: string;            // Format: +919876543210
  role: 'CITIZEN' | 'VOLUNTEER' | 'ADMIN';
  city: string;             // e.g. "Hyderabad"
  district: string;         // e.g. "Hyderabad"
  state: string;            // e.g. "Telangana"
  pincode: string;          // Format: 6-digit PIN code (e.g. 500072)
  isActive: boolean;        // Account active state (default true)
  createdAt: Timestamp;     // Document creation timestamp
  updatedAt: Timestamp;     // Last update timestamp
}
```

### 2.2 `alerts/{alertId}`
```typescript
interface AlertDocument {
  id: string;
  title: string;            // e.g. "Heavy Rainfall Warning - Hyderabad"
  description: string;
  disasterType: 'Flood' | 'Urban Flooding' | 'Cyclone' | 'Heavy Rainfall' | 'Heatwave' | 'Landslide' | 'Earthquake' | 'Drought' | 'Lightning' | 'Fire' | 'Other';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedArea: string;     // e.g. "Kukatpally, Madhapur, Begumpet"
  city: string;
  district: string;
  state: string;
  status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  createdBy: string;        // Admin UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
  isPublic: boolean;
  recommendedAction: string;
}
```

### 2.3 `incidents/{incidentId}`
```typescript
interface IncidentDocument {
  id: string;
  reporterId: string;       // Citizen UID
  title: string;
  description: string;
  incidentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;         // Detailed address/street
  city: string;
  district: string;
  state: string;
  photoUrl?: string;        // Optional Firebase Storage URL
  status: 'REPORTED' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verifiedBy?: string;      // Admin UID
  verifiedAt?: Timestamp;
}
```

### 2.4 `emergencyRequests/{requestId}`
```typescript
interface EmergencyRequestDocument {
  id: string;
  requesterId: string;      // Citizen UID
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

### 2.5 `safeLocations/{locationId}`
```typescript
interface SafeLocationDocument {
  id: string;
  name: string;             // e.g. "GHMC Indoor Stadium Relief Shelter"
  type: 'Relief Camp' | 'Hospital' | 'Shelter' | 'Community Center' | 'Other';
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  capacity: number;         // Total bed/occupant capacity
  currentOccupancy: number; // Enforced: 0 <= currentOccupancy <= capacity
  status: 'OPEN' | 'FULL' | 'CLOSED';
  contact: string;          // Phone (+91)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.6 `volunteers/{uid}`
```typescript
interface VolunteerDocument {
  userId: string;           // UID matching users collection
  skills: string[];         // e.g. ["First Aid", "Driving", "Rescue"]
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  phone: string;
  city: string;
  district: string;
  state: string;
  verified: boolean;        // Approved by Admin
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.7 `responses/{responseId}`
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

### 2.8 `notifications/{notificationId}`
```typescript
interface NotificationDocument {
  id: string;
  recipientUid: string;     // Citizen UID or 'PUBLIC'
  title: string;
  message: string;
  type: 'ALERT' | 'INCIDENT_UPDATE' | 'REQUEST_UPDATE' | 'ASSIGNMENT';
  link?: string;
  read: boolean;
  createdAt: Timestamp;
}
```

### 2.9 `auditLogs/{logId}`
```typescript
interface AuditLogDocument {
  id: string;
  actorUid: string;         // Admin UID
  action: string;           // e.g. "ALERT_CREATED", "USER_ROLE_CHANGED"
  entity: string;           // e.g. "alerts", "users"
  entityId: string;
  timestamp: Timestamp;
  summary: string;
}
```
