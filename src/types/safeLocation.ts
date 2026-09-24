import { Timestamp } from 'firebase/firestore';

export type LocationType =
  | 'SHELTER'
  | 'EVACUATION_CENTER'
  | 'HOSPITAL'
  | 'POLICE_STATION'
  | 'FIRE_STATION'
  | 'RELIEF_CENTER'
  | 'COMMUNITY_CENTER'
  | 'OTHER';

export type AvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED';

export type LocationService =
  | 'SHELTER'
  | 'FOOD'
  | 'WATER'
  | 'MEDICAL_CARE'
  | 'FIRST_AID'
  | 'SANITATION'
  | 'ELECTRICITY'
  | 'TRANSPORT'
  | 'CHARGING'
  | 'CHILD_SUPPORT'
  | 'ELDER_SUPPORT'
  | 'OTHER';

export interface SafeLocation {
  id: string;
  name: string;
  description: string;
  locationType: LocationType;
  address: string;
  landmark: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string | null;
  capacity: number | null;
  availabilityStatus: AvailabilityStatus;
  operatingHours: string | null;
  services: LocationService[];
  isActive: boolean;
  createdBy: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type CreateSafeLocationInput = Omit<
  SafeLocation,
  'id' | 'createdAt' | 'updatedAt'
>;

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  SHELTER: 'Emergency Shelter',
  EVACUATION_CENTER: 'Evacuation Center',
  HOSPITAL: 'Hospital / Medical Center',
  POLICE_STATION: 'Police Station',
  FIRE_STATION: 'Fire Station',
  RELIEF_CENTER: 'Disaster Relief Center',
  COMMUNITY_CENTER: 'Community Relief Center',
  OTHER: 'Safe Location',
};

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Available (Accepting People)',
  LIMITED: 'Limited Capacity',
  FULL: 'Full Capacity',
  CLOSED: 'Closed / Inactive',
};

export const AVAILABILITY_STATUS_DESCRIPTIONS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Currently open and accepting displaced citizens and families.',
  LIMITED: 'Operating with restricted capacity or limited specialized services.',
  FULL: 'At maximum shelter capacity. Not accepting additional displaced persons.',
  CLOSED: 'Not operating for emergency shelter or support at this time.',
};

export const LOCATION_SERVICE_LABELS: Record<LocationService, string> = {
  SHELTER: 'Overnight Shelter',
  FOOD: 'Meals & Food Supplies',
  WATER: 'Clean Drinking Water',
  MEDICAL_CARE: 'Doctor & Medical Care',
  FIRST_AID: 'First Aid Support',
  SANITATION: 'Sanitation & Washrooms',
  ELECTRICITY: 'Backup Power & Lighting',
  TRANSPORT: 'Emergency Evacuation Transport',
  CHARGING: 'Device Charging Station',
  CHILD_SUPPORT: 'Child Support & Milk',
  ELDER_SUPPORT: 'Elderly & Disability Aid',
  OTHER: 'General Relief Services',
};

export const AVAILABILITY_COLORS: Record<
  AvailabilityStatus,
  { bg: string; text: string; border: string }
> = {
  AVAILABLE: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  LIMITED: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  FULL: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};

export const getDirectionsUrl = (
  latitude: number | null,
  longitude: number | null,
  address: string,
  city: string,
  state: string
): string => {
  if (
    latitude !== null &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
  const fullAddressQuery = encodeURIComponent(`${address}, ${city}, ${state}, India`);
  return `https://www.google.com/maps/search/?api=1&query=${fullAddressQuery}`;
};
