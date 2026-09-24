import { Timestamp } from 'firebase/firestore';

export type IncidentType =
  | 'FLOOD'
  | 'URBAN_FLOODING'
  | 'CYCLONE'
  | 'HEAVY_RAINFALL'
  | 'HEATWAVE'
  | 'LANDSLIDE'
  | 'EARTHQUAKE'
  | 'DROUGHT'
  | 'LIGHTNING'
  | 'FIRE'
  | 'ROAD_ACCIDENT'
  | 'STRUCTURAL_DAMAGE'
  | 'MEDICAL_EMERGENCY'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'DISMISSED';

export interface Incident {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  location: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  status: IncidentStatus;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  verifiedBy?: string | null;
  verifiedAt?: Timestamp | Date | null;
  resolutionNotes?: string | null;
  resolvedAt?: Timestamp | Date | null;
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  FLOOD: 'Flood',
  URBAN_FLOODING: 'Urban Flooding',
  CYCLONE: 'Cyclone',
  HEAVY_RAINFALL: 'Heavy Rainfall',
  HEATWAVE: 'Heatwave',
  LANDSLIDE: 'Landslide',
  EARTHQUAKE: 'Earthquake',
  DROUGHT: 'Drought',
  LIGHTNING: 'Lightning',
  FIRE: 'Fire',
  ROAD_ACCIDENT: 'Road Accident',
  STRUCTURAL_DAMAGE: 'Structural Damage',
  MEDICAL_EMERGENCY: 'Medical Emergency',
  OTHER: 'Other',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Reported',
  VERIFIED: 'Verified',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};
