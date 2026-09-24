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
  VolunteerProfile,
  ApplyVolunteerInput,
  VolunteerAvailability,
  VolunteerVerificationStatus,
} from '../types/volunteer';
import { EmergencyRequest } from '../types/emergencyRequest';

const VOLUNTEERS_COLLECTION = 'volunteers';
const REQUESTS_COLLECTION = 'emergencyRequests';

export const applyAsVolunteer = async (
  userId: string,
  input: ApplyVolunteerInput
): Promise<void> => {
  const docRef = doc(db, VOLUNTEERS_COLLECTION, userId);

  const newVolunteer = {
    userId,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    district: input.district.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    skills: input.skills || [],
    availabilityStatus: input.availabilityStatus || 'AVAILABLE',
    verificationStatus: 'PENDING' as VolunteerVerificationStatus,
    isActive: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedBy: null,
    approvedAt: null,
  };

  await setDoc(docRef, newVolunteer);
};

export const getVolunteerProfile = async (userId: string): Promise<VolunteerProfile | null> => {
  const docRef = doc(db, VOLUNTEERS_COLLECTION, userId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    userId: snapshot.id,
    ...snapshot.data(),
  } as VolunteerProfile;
};

export const updateVolunteerProfile = async (
  userId: string,
  updates: Partial<Pick<VolunteerProfile, 'phone' | 'city' | 'district' | 'state' | 'pincode' | 'skills'>>
): Promise<void> => {
  const docRef = doc(db, VOLUNTEERS_COLLECTION, userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateVolunteerAvailability = async (
  userId: string,
  availabilityStatus: VolunteerAvailability
): Promise<void> => {
  const docRef = doc(db, VOLUNTEERS_COLLECTION, userId);
  await updateDoc(docRef, {
    availabilityStatus,
    updatedAt: serverTimestamp(),
  });
};

export const getAdminVolunteers = async (filters?: {
  verificationStatus?: VolunteerVerificationStatus | 'ALL';
  availabilityStatus?: VolunteerAvailability | 'ALL';
}): Promise<VolunteerProfile[]> => {
  let q = query(collection(db, VOLUNTEERS_COLLECTION), orderBy('createdAt', 'desc'));

  if (filters?.verificationStatus && filters.verificationStatus !== 'ALL') {
    q = query(q, where('verificationStatus', '==', filters.verificationStatus));
  }

  const snapshot = await getDocs(q);
  let list = snapshot.docs.map((docSnap) => ({
    userId: docSnap.id,
    ...docSnap.data(),
  })) as VolunteerProfile[];

  if (filters?.availabilityStatus && filters.availabilityStatus !== 'ALL') {
    list = list.filter((v) => v.availabilityStatus === filters.availabilityStatus);
  }

  return list;
};

export const approveVolunteer = async (userId: string, adminUid: string): Promise<void> => {
  const volRef = doc(db, VOLUNTEERS_COLLECTION, userId);
  const userRef = doc(db, 'users', userId);

  await updateDoc(volRef, {
    verificationStatus: 'APPROVED',
    isActive: true,
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Promote user role to VOLUNTEER in users collection
  await updateDoc(userRef, {
    role: 'VOLUNTEER',
    updatedAt: serverTimestamp(),
  });
};

export const rejectVolunteer = async (userId: string): Promise<void> => {
  const volRef = doc(db, VOLUNTEERS_COLLECTION, userId);
  await updateDoc(volRef, {
    verificationStatus: 'REJECTED',
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

export const suspendVolunteer = async (userId: string): Promise<void> => {
  const volRef = doc(db, VOLUNTEERS_COLLECTION, userId);
  const userRef = doc(db, 'users', userId);

  await updateDoc(volRef, {
    verificationStatus: 'SUSPENDED',
    isActive: false,
    updatedAt: serverTimestamp(),
  });

  // Revert user role back to CITIZEN
  await updateDoc(userRef, {
    role: 'CITIZEN',
    updatedAt: serverTimestamp(),
  });
};

export const getVolunteerTasks = async (volunteerId: string): Promise<EmergencyRequest[]> => {
  const q = query(
    collection(db, REQUESTS_COLLECTION),
    where('assignedVolunteerId', '==', volunteerId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as EmergencyRequest[];
};

export const acceptAssignment = async (requestId: string, volunteerId: string): Promise<void> => {
  const reqRef = doc(db, REQUESTS_COLLECTION, requestId);
  const volRef = doc(db, VOLUNTEERS_COLLECTION, volunteerId);

  await updateDoc(reqRef, {
    status: 'ASSIGNED',
    updatedAt: serverTimestamp(),
  });

  await updateDoc(volRef, {
    availabilityStatus: 'BUSY',
    updatedAt: serverTimestamp(),
  });
};

export const rejectAssignment = async (requestId: string, volunteerId: string): Promise<void> => {
  const reqRef = doc(db, REQUESTS_COLLECTION, requestId);
  const volRef = doc(db, VOLUNTEERS_COLLECTION, volunteerId);

  await updateDoc(reqRef, {
    assignedVolunteerId: null,
    status: 'ACKNOWLEDGED',
    updatedAt: serverTimestamp(),
  });

  await updateDoc(volRef, {
    availabilityStatus: 'AVAILABLE',
    updatedAt: serverTimestamp(),
  });
};

export const startVolunteerResponse = async (requestId: string): Promise<void> => {
  const reqRef = doc(db, REQUESTS_COLLECTION, requestId);
  await updateDoc(reqRef, {
    status: 'IN_PROGRESS',
    updatedAt: serverTimestamp(),
  });
};
