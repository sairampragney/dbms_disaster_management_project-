import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  SafeLocation,
  CreateSafeLocationInput,
  LocationType,
  AvailabilityStatus,
} from '../types/safeLocation';

const COLLECTION_NAME = 'safeLocations';

export const getPublicSafeLocations = async (filters?: {
  locationType?: LocationType | 'ALL';
  availabilityStatus?: AvailabilityStatus | 'ALL';
  state?: string;
  city?: string;
}): Promise<SafeLocation[]> => {
  let q = query(
    collection(db, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );

  if (filters?.locationType && filters.locationType !== 'ALL') {
    q = query(q, where('locationType', '==', filters.locationType));
  }

  if (filters?.availabilityStatus && filters.availabilityStatus !== 'ALL') {
    q = query(q, where('availabilityStatus', '==', filters.availabilityStatus));
  }

  if (filters?.state && filters.state.trim() !== '') {
    q = query(q, where('state', '==', filters.state.trim()));
  }

  if (filters?.city && filters.city.trim() !== '') {
    q = query(q, where('city', '==', filters.city.trim()));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as SafeLocation[];
};

export const getSafeLocation = async (locationId: string): Promise<SafeLocation | null> => {
  const docRef = doc(db, COLLECTION_NAME, locationId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as SafeLocation;
};

export const getAdminSafeLocations = async (): Promise<SafeLocation[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as SafeLocation[];
};

export const createSafeLocation = async (
  input: CreateSafeLocationInput
): Promise<string> => {
  const docRef = doc(collection(db, COLLECTION_NAME));

  const newLocation = {
    name: input.name.trim(),
    description: input.description.trim(),
    locationType: input.locationType,
    address: input.address.trim(),
    landmark: input.landmark ? input.landmark.trim() : null,
    city: input.city.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    contactPhone: input.contactPhone ? input.contactPhone.trim() : null,
    capacity: input.capacity !== null && input.capacity >= 0 ? input.capacity : null,
    availabilityStatus: input.availabilityStatus,
    operatingHours: input.operatingHours ? input.operatingHours.trim() : null,
    services: input.services || [],
    isActive: input.isActive ?? true,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, newLocation);
  return docRef.id;
};

export const updateSafeLocation = async (
  locationId: string,
  updates: Partial<Omit<SafeLocation, 'id' | 'createdBy' | 'createdAt'>>
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, locationId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deactivateSafeLocation = async (locationId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, locationId);
  await updateDoc(docRef, {
    isActive: false,
    availabilityStatus: 'CLOSED',
    updatedAt: serverTimestamp(),
  });
};

export const reactivateSafeLocation = async (locationId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, locationId);
  await updateDoc(docRef, {
    isActive: true,
    availabilityStatus: 'AVAILABLE',
    updatedAt: serverTimestamp(),
  });
};
