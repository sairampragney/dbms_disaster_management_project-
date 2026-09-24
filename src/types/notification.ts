import { Timestamp } from 'firebase/firestore';

export type NotificationType =
  | 'DISASTER_ALERT'
  | 'INCIDENT_UPDATE'
  | 'EMERGENCY_REQUEST_UPDATE'
  | 'VOLUNTEER_ASSIGNMENT'
  | 'VOLUNTEER_APPLICATION_UPDATE'
  | 'SAFE_LOCATION_UPDATE'
  | 'SYSTEM_NOTICE';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RelatedEntityType =
  | 'ALERT'
  | 'INCIDENT'
  | 'EMERGENCY_REQUEST'
  | 'VOLUNTEER'
  | 'SAFE_LOCATION'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: string | null;
  priority: NotificationPriority;
  isRead: boolean;
  createdBy: string;
  createdAt: Timestamp | Date;
  readAt: Timestamp | Date | null;
}

export type CreateNotificationInput = Omit<
  AppNotification,
  'id' | 'isRead' | 'createdAt' | 'readAt'
>;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  DISASTER_ALERT: 'Disaster Advisory Alert',
  INCIDENT_UPDATE: 'Incident Status Update',
  EMERGENCY_REQUEST_UPDATE: 'Emergency Request Update',
  VOLUNTEER_ASSIGNMENT: 'Volunteer Dispatch Assignment',
  VOLUNTEER_APPLICATION_UPDATE: 'Volunteer Application Update',
  SAFE_LOCATION_UPDATE: 'Shelter & Safe Location Update',
  SYSTEM_NOTICE: 'System Administrative Notice',
};

export const NOTIFICATION_PRIORITY_COLORS: Record<
  NotificationPriority,
  { bg: string; text: string; border: string }
> = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
};

export const getRelatedEntityRoute = (
  entityType: RelatedEntityType | null,
  entityId: string | null,
  userRole?: string
): string | null => {
  if (!entityType || !entityId) return null;

  switch (entityType) {
    case 'ALERT':
      return `/alerts/${entityId}`;
    case 'INCIDENT':
      return userRole === 'ADMIN' ? `/admin/incidents/${entityId}` : `/incidents/${entityId}`;
    case 'EMERGENCY_REQUEST':
      return userRole === 'ADMIN'
        ? `/admin/emergency-requests/${entityId}`
        : userRole === 'VOLUNTEER'
        ? `/volunteer/tasks/${entityId}`
        : `/emergency-requests/${entityId}`;
    case 'VOLUNTEER':
      return userRole === 'ADMIN' ? `/admin/volunteers/${entityId}` : `/volunteer/profile`;
    case 'SAFE_LOCATION':
      return userRole === 'ADMIN'
        ? `/admin/safe-locations/${entityId}`
        : `/safe-locations/${entityId}`;
    default:
      return null;
  }
};
