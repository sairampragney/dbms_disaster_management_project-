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
import { Alert, DisasterType, AlertSeverity, AlertStatus } from '../types/alert';

const ALERTS_COLLECTION = 'alerts';

export interface AlertFilterOptions {
  disasterType?: DisasterType | 'ALL';
  severity?: AlertSeverity | 'ALL';
  state?: string | 'ALL';
  city?: string | 'ALL';
  status?: AlertStatus | 'ALL';
}

export const getPublicAlerts = async (filters?: AlertFilterOptions, maxLimit = 50): Promise<Alert[]> => {
  try {
    const alertsRef = collection(db, ALERTS_COLLECTION);
    let q = query(alertsRef, where('isPublic', '==', true), orderBy('createdAt', 'desc'), limit(maxLimit));

    if (filters?.status && filters.status !== 'ALL') {
      q = query(alertsRef, where('isPublic', '==', true), where('status', '==', filters.status), orderBy('createdAt', 'desc'), limit(maxLimit));
    }

    const querySnapshot = await getDocs(q);
    const alerts: Alert[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Omit<Alert, 'id'>;
      alerts.push({ id: docSnap.id, ...data });
    });

    // Client-side sub-filtering for composite criteria to avoid complex indexes
    return alerts.filter((item) => {
      if (filters?.disasterType && filters.disasterType !== 'ALL' && item.disasterType !== filters.disasterType) return false;
      if (filters?.severity && filters.severity !== 'ALL' && item.severity !== filters.severity) return false;
      if (filters?.state && filters.state !== 'ALL' && item.state.toLowerCase() !== filters.state.toLowerCase()) return false;
      if (filters?.city && filters.city !== 'ALL' && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      return true;
    });
  } catch (err) {
    console.error('Error fetching public alerts:', err);
    throw err;
  }
};

export const getAlertById = async (alertId: string): Promise<Alert | null> => {
  try {
    const alertRef = doc(db, ALERTS_COLLECTION, alertId);
    const docSnap = await getDoc(alertRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Alert, 'id'>) };
    }
    return null;
  } catch (err) {
    console.error(`Error fetching alert ${alertId}:`, err);
    throw err;
  }
};

export const createAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const alertRef = doc(collection(db, ALERTS_COLLECTION));
    const now = Timestamp.now();

    const newAlert = {
      ...alertData,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(alertRef, newAlert);
    return alertRef.id;
  } catch (err) {
    console.error('Error creating alert:', err);
    throw err;
  }
};

export const updateAlert = async (alertId: string, alertData: Partial<Alert>): Promise<void> => {
  try {
    const alertRef = doc(db, ALERTS_COLLECTION, alertId);
    await updateDoc(alertRef, {
      ...alertData,
      updatedAt: Timestamp.now(),
    });
  } catch (err) {
    console.error(`Error updating alert ${alertId}:`, err);
    throw err;
  }
};

export const resolveAlert = async (alertId: string): Promise<void> => {
  return updateAlert(alertId, { status: 'RESOLVED' });
};
