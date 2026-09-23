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
  EmergencyRequest,
  CreateEmergencyRequestInput,
  RequestStatus,
  RequestPriority,
  RequestType,
} from '../types/emergencyRequest';

const COLLECTION_NAME = 'emergencyRequests';

export const createEmergencyRequest = async (
  input: CreateEmergencyRequestInput
): Promise<string> => {
  const requestRef = doc(collection(db, COLLECTION_NAME));

  const newRequest = {
    requesterId: input.requesterId,
    title: input.title,
    description: input.description,
    requestType: input.requestType,
    priority: input.priority,
    location: input.location,
    city: input.city,
    district: input.district,
    state: input.state,
    pincode: input.pincode,
    latitude: input.latitude,
    longitude: input.longitude,
    status: 'PENDING' as RequestStatus,
    assignedVolunteerId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
    resolutionNotes: null,
  };

  await setDoc(requestRef, newRequest);
  return requestRef.id;
};

export const getEmergencyRequest = async (requestId: string): Promise<EmergencyRequest | null> => {
  const docRef = doc(db, COLLECTION_NAME, requestId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as EmergencyRequest;
};

export const getMyEmergencyRequests = async (requesterId: string): Promise<EmergencyRequest[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('requesterId', '==', requesterId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as EmergencyRequest[];
};

export const cancelEmergencyRequest = async (
  requestId: string,
  currentStatus: RequestStatus
): Promise<void> => {
  if (currentStatus !== 'PENDING' && currentStatus !== 'ACKNOWLEDGED') {
    throw new Error(`Requests in status ${currentStatus} cannot be cancelled.`);
  }

  const docRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(docRef, {
    status: 'CANCELLED',
    updatedAt: serverTimestamp(),
  });
};

export const getAdminEmergencyRequests = async (filters?: {
  status?: RequestStatus | 'ALL';
  priority?: RequestPriority | 'ALL';
  requestType?: RequestType | 'ALL';
}): Promise<EmergencyRequest[]> => {
  let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

  if (filters?.status && filters.status !== 'ALL') {
    q = query(q, where('status', '==', filters.status));
  }

  const snapshot = await getDocs(q);
  let requests = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as EmergencyRequest[];

  if (filters?.priority && filters.priority !== 'ALL') {
    requests = requests.filter((r) => r.priority === filters.priority);
  }

  if (filters?.requestType && filters.requestType !== 'ALL') {
    requests = requests.filter((r) => r.requestType === filters.requestType);
  }

  return requests;
};

export const acknowledgeEmergencyRequest = async (requestId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(docRef, {
    status: 'ACKNOWLEDGED',
    updatedAt: serverTimestamp(),
  });
};

export const assignVolunteer = async (
  requestId: string,
  volunteerId: string | null
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(docRef, {
    assignedVolunteerId: volunteerId,
    status: volunteerId ? 'ASSIGNED' : 'ACKNOWLEDGED',
    updatedAt: serverTimestamp(),
  });
};

export const startEmergencyResponse = async (requestId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(docRef, {
    status: 'IN_PROGRESS',
    updatedAt: serverTimestamp(),
  });
};

export const resolveEmergencyRequest = async (
  requestId: string,
  resolutionNotes: string
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(docRef, {
    status: 'RESOLVED',
    resolutionNotes: resolutionNotes.trim(),
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};
