import { Timestamp } from 'firebase/firestore';

export type DisasterType =
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
  | 'OTHER';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

export interface Alert {
  id: string;
  title: string;
  description: string;
  disasterType: DisasterType;
  severity: AlertSeverity;
  affectedArea: string;
  city: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  status: AlertStatus;
  createdBy: string; // Admin UID
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  isPublic: boolean;
  recommendedAction: string;
}

export const DISASTER_TYPE_LABELS: Record<DisasterType, string> = {
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
  OTHER: 'Other',
};
