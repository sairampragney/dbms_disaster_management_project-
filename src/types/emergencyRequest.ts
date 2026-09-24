import { Timestamp } from 'firebase/firestore';

export type RequestType =
  | 'MEDICAL_ASSISTANCE'
  | 'FOOD_WATER'
  | 'EVACUATION'
  | 'SHELTER'
  | 'RESCUE'
  | 'TRANSPORT'
  | 'MISSING_PERSON'
  | 'TRAPPED_PERSON'
  | 'FIRE_ASSISTANCE'
  | 'SUPPLIES'
  | 'OTHER';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequestStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export interface EmergencyRequest {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  requestType: RequestType;
  priority: RequestPriority;
  location: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  status: RequestStatus;
  assignedVolunteerId: string | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  resolvedAt: Timestamp | Date | null;
  resolutionNotes: string | null;
}

export type CreateEmergencyRequestInput = Omit<
  EmergencyRequest,
  | 'id'
  | 'status'
  | 'assignedVolunteerId'
  | 'createdAt'
  | 'updatedAt'
  | 'resolvedAt'
  | 'resolutionNotes'
>;

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  MEDICAL_ASSISTANCE: 'Medical Assistance & First Aid',
  FOOD_WATER: 'Food & Drinking Water Supplies',
  EVACUATION: 'Emergency Evacuation',
  SHELTER: 'Temporary Shelter & Relief',
  RESCUE: 'Active Search & Rescue',
  TRANSPORT: 'Emergency Medical Transport',
  MISSING_PERSON: 'Missing Person Report',
  TRAPPED_PERSON: 'Trapped / Stranded Person',
  FIRE_ASSISTANCE: 'Fire Hazard & Extinguishing',
  SUPPLIES: 'Essential Supplies & Medicine',
  OTHER: 'Other Urgent Assistance',
};

export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  LOW: 'LOW - General Aid',
  MEDIUM: 'MEDIUM - Urgent Need',
  HIGH: 'HIGH - High Priority',
  CRITICAL: 'CRITICAL - Life Threatening',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pending Review',
  ACKNOWLEDGED: 'Acknowledged by Response Team',
  ASSIGNED: 'Volunteer Assigned',
  IN_PROGRESS: 'Response In Progress',
  RESOLVED: 'Fulfilled / Resolved',
  CANCELLED: 'Cancelled by Requester',
};

export const PRIORITY_COLORS: Record<RequestPriority, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
};

export const isValidRequestStatusTransition = (
  currentStatus: RequestStatus,
  nextStatus: RequestStatus
): boolean => {
  const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
    PENDING: ['ACKNOWLEDGED', 'CANCELLED'],
    ACKNOWLEDGED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: [],
    CANCELLED: [],
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
};
