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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '../types/incident';

const INCIDENTS_COLLECTION = 'incidents';

export interface AdminIncidentFilterOptions {
  status?: IncidentStatus | 'ALL';
  severity?: IncidentSeverity | 'ALL';
  incidentType?: IncidentType | 'ALL';
  state?: string | 'ALL';
  city?: string | 'ALL';
}

export const createIncident = async (
  data: Omit<
    Incident,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'status'
    | 'verifiedBy'
    | 'verifiedAt'
    | 'resolutionNotes'
    | 'resolvedAt'
  >
): Promise<string> => {
  try {
    const incidentRef = doc(collection(db, INCIDENTS_COLLECTION));
    const now = Timestamp.now();

    const newIncident: Omit<Incident, 'id'> = {
      ...data,
      status: 'REPORTED',
      createdAt: now,
      updatedAt: now,
      verifiedBy: null,
      verifiedAt: null,
      resolutionNotes: null,
      resolvedAt: null,
    };

    await setDoc(incidentRef, newIncident);
    return incidentRef.id;
  } catch (err) {
    console.error('Error creating incident:', err);
    throw err;
  }
};

export const getIncidentById = async (incidentId: string): Promise<Incident | null> => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const docSnap = await getDoc(incidentRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Incident, 'id'>) };
    }
    return null;
  } catch (err) {
    console.error(`Error fetching incident ${incidentId}:`, err);
    throw err;
  }
};

export const getMyIncidents = async (reporterId: string, maxLimit = 50): Promise<Incident[]> => {
  try {
    const incidentsRef = collection(db, INCIDENTS_COLLECTION);
    const q = query(
      incidentsRef,
      where('reporterId', '==', reporterId),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    );

    const querySnapshot = await getDocs(q);
    const list: Incident[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Incident, 'id'>) });
    });
    return list;
  } catch (err) {
    console.error('Error fetching my incidents:', err);
    throw err;
  }
};

export const updateCitizenIncident = async (
  incidentId: string,
  data: Partial<
    Omit<
      Incident,
      | 'id'
      | 'reporterId'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
      | 'verifiedBy'
      | 'verifiedAt'
      | 'resolutionNotes'
      | 'resolvedAt'
    >
  >
): Promise<void> => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    await updateDoc(incidentRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (err) {
    console.error(`Error updating citizen incident ${incidentId}:`, err);
    throw err;
  }
};

export const getAdminIncidents = async (
  filters?: AdminIncidentFilterOptions,
  maxLimit = 50
): Promise<Incident[]> => {
  try {
    const incidentsRef = collection(db, INCIDENTS_COLLECTION);
    let q = query(incidentsRef, orderBy('createdAt', 'desc'), limit(maxLimit));

    if (filters?.status && filters.status !== 'ALL') {
      q = query(
        incidentsRef,
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc'),
        limit(maxLimit)
      );
    }

    const querySnapshot = await getDocs(q);
    const list: Incident[] = [];

    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Incident, 'id'>) });
    });

    // Client-side sub-filtering for multi-criteria
    return list.filter((item) => {
      if (filters?.severity && filters.severity !== 'ALL' && item.severity !== filters.severity)
        return false;
      if (
        filters?.incidentType &&
        filters.incidentType !== 'ALL' &&
        item.incidentType !== filters.incidentType
      )
        return false;
      if (
        filters?.state &&
        filters.state !== 'ALL' &&
        item.state.toLowerCase() !== filters.state.toLowerCase()
      )
        return false;
      if (
        filters?.city &&
        filters.city !== 'ALL' &&
        item.city.toLowerCase() !== filters.city.toLowerCase()
      )
        return false;
      return true;
    });
  } catch (err) {
    console.error('Error fetching admin incidents:', err);
    throw err;
  }
};

export const verifyIncident = async (incidentId: string, adminUid: string): Promise<void> => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const now = Timestamp.now();
    await updateDoc(incidentRef, {
      status: 'VERIFIED',
      verifiedBy: adminUid,
      verifiedAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error(`Error verifying incident ${incidentId}:`, err);
    throw err;
  }
};

export const startIncidentResponse = async (incidentId: string): Promise<void> => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const now = Timestamp.now();
    await updateDoc(incidentRef, {
      status: 'IN_PROGRESS',
      updatedAt: now,
    });
  } catch (err) {
    console.error(`Error starting incident response ${incidentId}:`, err);
    throw err;
  }
};

export const resolveIncident = async (incidentId: string, resolutionNotes: string): Promise<void> => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const now = Timestamp.now();
    await updateDoc(incidentRef, {
      status: 'RESOLVED',
      resolutionNotes,
      resolvedAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error(`Error resolving incident ${incidentId}:`, err);
    throw err;
  }
};

export const dismissIncident = async (incidentId: string, resolutionNotes: string): Promise<void> => {
  try {
    const incidentRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const now = Timestamp.now();
    await updateDoc(incidentRef, {
      status: 'DISMISSED',
      resolutionNotes,
      updatedAt: now,
    });
  } catch (err) {
    console.error(`Error dismissing incident ${incidentId}:`, err);
    throw err;
  }
};
