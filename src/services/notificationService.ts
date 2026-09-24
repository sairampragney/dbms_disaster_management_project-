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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppNotification, CreateNotificationInput } from '../types/notification';

const COLLECTION_NAME = 'notifications';

export const getMyNotifications = async (recipientId: string): Promise<AppNotification[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('recipientId', '==', recipientId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as AppNotification[];
};

export const getUnreadNotificationCount = async (recipientId: string): Promise<number> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('recipientId', '==', recipientId),
    where('isRead', '==', false)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const getNotificationById = async (
  notificationId: string
): Promise<AppNotification | null> => {
  const docRef = doc(db, COLLECTION_NAME, notificationId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as AppNotification;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, notificationId);
  await updateDoc(docRef, {
    isRead: true,
    readAt: serverTimestamp(),
  });
};

export const markAllNotificationsAsRead = async (recipientId: string): Promise<void> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('recipientId', '==', recipientId),
    where('isRead', '==', false)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      isRead: true,
      readAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

export const createAdminNotification = async (
  input: CreateNotificationInput
): Promise<string> => {
  const docRef = doc(collection(db, COLLECTION_NAME));

  const newNotification = {
    recipientId: input.recipientId.trim(),
    title: input.title.trim(),
    message: input.message.trim(),
    notificationType: input.notificationType,
    relatedEntityType: input.relatedEntityType || null,
    relatedEntityId: input.relatedEntityId ? input.relatedEntityId.trim() : null,
    priority: input.priority,
    isRead: false,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    readAt: null,
  };

  await setDoc(docRef, newNotification);
  return docRef.id;
};
