import { Timestamp } from 'firebase/firestore';

export type VolunteerSkill =
  | 'MEDICAL_AID'
  | 'FIRST_AID'
  | 'RESCUE'
  | 'SWIMMING'
  | 'DRIVING'
  | 'TRANSPORT'
  | 'FOOD_DISTRIBUTION'
  | 'WATER_DISTRIBUTION'
  | 'EVACUATION_SUPPORT'
  | 'SEARCH_SUPPORT'
  | 'COMMUNICATION'
  | 'CROWD_SUPPORT'
  | 'CHILD_SUPPORT'
  | 'ELDER_SUPPORT'
  | 'TECH_SUPPORT'
  | 'OTHER';

export type VolunteerAvailability = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';

export type VolunteerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface VolunteerProfile {
  userId: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  skills: VolunteerSkill[];
  availabilityStatus: VolunteerAvailability;
  verificationStatus: VolunteerVerificationStatus;
  isActive: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  approvedBy: string | null;
  approvedAt: Timestamp | Date | null;
}

export type ApplyVolunteerInput = Omit<
  VolunteerProfile,
  | 'userId'
  | 'verificationStatus'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
  | 'approvedBy'
  | 'approvedAt'
>;

export const VOLUNTEER_SKILL_LABELS: Record<VolunteerSkill, string> = {
  MEDICAL_AID: 'Medical Aid & Doctor Support',
  FIRST_AID: 'First Aid & Paramedic Aid',
  RESCUE: 'Search & Water Rescue',
  SWIMMING: 'Deep Water Swimming',
  DRIVING: 'Heavy Vehicle & Ambulance Driving',
  TRANSPORT: 'Emergency Relief Logistics',
  FOOD_DISTRIBUTION: 'Community Kitchen & Food Distribution',
  WATER_DISTRIBUTION: 'Drinking Water Tanker Relief',
  EVACUATION_SUPPORT: 'Disaster Evacuation Aid',
  SEARCH_SUPPORT: 'Search & Rescue Operation Support',
  COMMUNICATION: 'Ham Radio & Wireless Logistics',
  CROWD_SUPPORT: 'Relief Camp Crowd Management',
  CHILD_SUPPORT: 'Child Care & Infant Relief',
  ELDER_SUPPORT: 'Elderly & Disabled Relief',
  TECH_SUPPORT: 'IT & Control Room Support',
  OTHER: 'General Disaster Relief',
};

export const AVAILABILITY_LABELS: Record<VolunteerAvailability, string> = {
  AVAILABLE: 'Available (Ready for Dispatch)',
  BUSY: 'Busy (On Active Assignment)',
  UNAVAILABLE: 'Unavailable',
};

export const VERIFICATION_STATUS_LABELS: Record<VolunteerVerificationStatus, string> = {
  PENDING: 'Pending Administrative Verification',
  APPROVED: 'Approved Volunteer Responder',
  REJECTED: 'Application Rejected',
  SUSPENDED: 'Suspended from Dispatch',
};

export const VERIFICATION_STATUS_COLORS: Record<
  VolunteerVerificationStatus,
  { bg: string; text: string; border: string }
> = {
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
  SUSPENDED: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};
