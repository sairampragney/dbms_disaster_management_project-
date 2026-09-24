# Security Test Matrix

This matrix documents authorization boundaries, role-based access controls, IDOR protections, and field-level mutation restrictions enforced by `firestore.rules` for the **Disaster Alert & Community Response** system.

---

## Authorization & Role Boundary Matrix

| Resource / Collection | Actor | Operation | Expected Outcome | Enforced Security Rule Condition |
| --- | --- | --- | --- | --- |
| `users/{userId}` | Anonymous | Read / Write | **DENIED** | `isSignedIn()` required. |
| `users/{userId}` | Citizen A | Read own profile | **ALLOWED** | `isOwner(userId)` |
| `users/{userId}` | Citizen A | Read Citizen B profile | **DENIED** | `isOwner(userId) \|\| isAdmin()` |
| `users/{userId}` | Citizen A | Update own profile (name, phone) | **ALLOWED** | `isOwner(userId)` |
| `users/{userId}` | Citizen A | Mutate own role (`CITIZEN` -> `ADMIN`) | **DENIED** | `!affectedKeys().hasAny(['role', 'uid', 'isActive'])` |
| `users/{userId}` | Citizen A | Delete user profile | **DENIED** | `isAdmin()` required for delete. |
| `users/{userId}` | Admin | Manage any user profile | **ALLOWED** | `isAdmin()` |
| `alerts/{alertId}` | Public / Citizen | Read public active alert | **ALLOWED** | `resource.data.isPublic == true` |
| `alerts/{alertId}` | Citizen | Create alert | **DENIED** | `isAdmin()` required for create/update/delete. |
| `alerts/{alertId}` | Volunteer | Edit alert severity / status | **DENIED** | `isAdmin()` required for create/update/delete. |
| `alerts/{alertId}` | Admin | Create / Edit / Resolve alert | **ALLOWED** | `isAdmin()` |
| `incidents/{incidentId}` | Citizen A | Read own incident report | **ALLOWED** | `isOwner(resource.data.reporterId)` |
| `incidents/{incidentId}` | Citizen A | Read Citizen B incident report | **DENIED** | `isOwner(resource.data.reporterId) \|\| isAdmin() \|\| isApprovedVolunteer()` |
| `incidents/{incidentId}` | Citizen A | Create incident with `reporterId = Citizen B` | **DENIED** | `request.resource.data.reporterId == request.auth.uid` |
| `incidents/{incidentId}` | Citizen A | Create incident with `status = VERIFIED` | **DENIED** | `request.resource.data.status == 'REPORTED'` required on create. |
| `incidents/{incidentId}` | Citizen A | Mutate `verifiedBy` / `verifiedAt` / `status` | **DENIED** | `!affectedKeys().hasAny(['status', 'verifiedBy', 'verifiedAt', 'resolutionNotes', 'resolvedAt'])` |
| `incidents/{incidentId}` | Approved Volunteer | Read verified incident | **ALLOWED** | `isApprovedVolunteer()` |
| `incidents/{incidentId}` | Admin | Verify / Progress / Resolve incident | **ALLOWED** | `isAdmin()` |
| `emergencyRequests/{requestId}` | Citizen A | Read own request | **ALLOWED** | `isOwner(resource.data.requesterId)` |
| `emergencyRequests/{requestId}` | Citizen A | Read Citizen B request | **DENIED** | Requester ownership, assigned volunteer, or admin required. |
| `emergencyRequests/{requestId}` | Citizen A | Cancel own pending request | **ALLOWED** | Status transition to `CANCELLED` permitted for `PENDING`/`ACKNOWLEDGED`. |
| `emergencyRequests/{requestId}` | Citizen A | Assign volunteer to request | **DENIED** | `!affectedKeys().hasAny(['assignedVolunteerId'])` |
| `emergencyRequests/{requestId}` | Assigned Volunteer | View / Update assigned task | **ALLOWED** | `resource.data.assignedVolunteerId == request.auth.uid` |
| `emergencyRequests/{requestId}` | Unassigned Volunteer | Mutate request status | **DENIED** | `resource.data.assignedVolunteerId == request.auth.uid` |
| `safeLocations/{locationId}` | Public | Read active safe location (`isActive == true`) | **ALLOWED** | `resource.data.isActive == true` |
| `safeLocations/{locationId}` | Public / Citizen | Read inactive safe location (`isActive == false`) | **DENIED** | `isAdmin()` required for inactive locations. |
| `safeLocations/{locationId}` | Citizen / Volunteer | Create / Edit / Deactivate location | **DENIED** | `isAdmin()` required. |
| `safeLocations/{locationId}` | Admin | Create / Edit / Deactivate location | **ALLOWED** | `isAdmin()` |
| `volunteers/{userId}` | Citizen | Submit volunteer application | **ALLOWED** | Creation locked to `verificationStatus: 'PENDING'`, `isActive: false`. |
| `volunteers/{userId}` | Citizen | Self-approve volunteer application | **DENIED** | `!affectedKeys().hasAny(['verificationStatus', 'isActive', 'approvedBy', 'approvedAt'])` |
| `volunteers/{userId}` | Unapproved Volunteer | View volunteer task dispatch feed | **DENIED** | `isApprovedVolunteer()` check requires `verificationStatus == 'APPROVED'` & `isActive == true`. |
| `volunteers/{userId}` | Admin | Approve / Reject / Suspend volunteer | **ALLOWED** | `isAdmin()` |
| `notifications/{notificationId}` | Citizen A | Read own notification | **ALLOWED** | `resource.data.recipientId == request.auth.uid` |
| `notifications/{notificationId}` | Citizen A | Read Citizen B notification | **DENIED** | `resource.data.recipientId == request.auth.uid \|\| isAdmin()` |
| `notifications/{notificationId}` | Citizen A | Mark own notification read (`isRead = true`) | **ALLOWED** | Permitted read-state update. |
| `notifications/{notificationId}` | Citizen A | Mutate notification message or priority | **DENIED** | `!affectedKeys().hasAny(['title', 'message', 'priority', 'createdBy', 'createdAt'])` |
| `notifications/{notificationId}` | Citizen / Volunteer | Create notification for another user | **DENIED** | `isAdmin()` required on create. |
| `auditLogs/{logId}` | Citizen / Volunteer | Read / Write audit logs | **DENIED** | `isAdmin()` required for read; client write is `false`. |

---

## Status Transition Validation Summary

1. **Incidents**: `REPORTED` -> `VERIFIED` -> `IN_PROGRESS` -> `RESOLVED` (or `DISMISSED`). Citizens can only submit as `REPORTED`. Status changes are restricted to administrators.
2. **Emergency Requests**: `PENDING` -> `ACKNOWLEDGED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` (or `CANCELLED`). Requester can transition to `CANCELLED` only while status is `PENDING` or `ACKNOWLEDGED`. Volunteers can update status only on tasks where `assignedVolunteerId == auth.uid`.
3. **Volunteers**: `PENDING` -> `APPROVED` / `REJECTED` -> `SUSPENDED`. Applicants start as `PENDING` with `isActive: false`. Only admins can approve or suspend.
4. **Safe Locations**: `AVAILABLE` / `LIMITED` / `FULL` / `CLOSED`. Inactive records (`isActive == false`) are hidden from public reads.
