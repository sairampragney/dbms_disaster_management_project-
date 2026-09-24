import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'disaster-management-syst-ca22d';
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesPath = resolve(__dirname, '../../firestore.rules');
  const rules = readFileSync(rulesPath, 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: 'localhost',
      port: 8080,
      rules,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

describe('Firestore Security Rules - Notifications Collection (Tests A - M)', () => {
  const citizenA = 'citizen-a-uid';
  const citizenB = 'citizen-b-uid';
  const volunteerUid = 'volunteer-uid-123';
  const adminUid = 'admin-user-uid';

  const notifAId = 'notif-belonging-to-a';
  const notifBId = 'notif-belonging-to-b';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // Seed Users
      await setDoc(doc(db, 'users', citizenA), { uid: citizenA, role: 'CITIZEN', isActive: true });
      await setDoc(doc(db, 'users', citizenB), { uid: citizenB, role: 'CITIZEN', isActive: true });
      await setDoc(doc(db, 'users', volunteerUid), { uid: volunteerUid, role: 'VOLUNTEER', isActive: true });
      await setDoc(doc(db, 'users', adminUid), { uid: adminUid, role: 'ADMIN', isActive: true });

      // Seed Notifications
      await setDoc(doc(db, 'notifications', notifAId), {
        recipientId: citizenA,
        title: 'Emergency Assistance Update',
        message: 'Your emergency request has been acknowledged.',
        notificationType: 'EMERGENCY_REQUEST_UPDATE',
        relatedEntityType: 'EMERGENCY_REQUEST',
        relatedEntityId: 'request-123',
        priority: 'HIGH',
        isRead: false,
        createdBy: adminUid,
        createdAt: new Date(),
        readAt: null,
      });

      await setDoc(doc(db, 'notifications', notifBId), {
        recipientId: citizenB,
        title: 'Disaster Warning Advisory',
        message: 'Heavy Rainfall Warning for Hyderabad.',
        notificationType: 'DISASTER_ALERT',
        relatedEntityType: 'ALERT',
        relatedEntityId: 'alert-456',
        priority: 'CRITICAL',
        isRead: false,
        createdBy: adminUid,
        createdAt: new Date(),
        readAt: null,
      });
    });
  });

  // Test A: Citizen reads own notification -> ALLOWED
  it('Test A: allows Citizen A to read their own notification', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertSucceeds(getDoc(doc(dbA, 'notifications', notifAId)));
  });

  // Test B: Citizen reads another user's notification -> DENIED
  it('Test B: denies Citizen A from reading Citizen B notification', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(getDoc(doc(dbA, 'notifications', notifBId)));
  });

  // Test C: Volunteer reads another user's notification -> DENIED
  it('Test C: denies Volunteer from reading Citizen A private notification', async () => {
    const dbVol = testEnv.authenticatedContext(volunteerUid).firestore();
    await assertFails(getDoc(doc(dbVol, 'notifications', notifAId)));
  });

  // Test D: Citizen marks own notification as read -> ALLOWED
  it('Test D: allows Citizen A to update isRead and readAt on their own notification', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertSucceeds(
      updateDoc(doc(dbA, 'notifications', notifAId), {
        isRead: true,
        readAt: new Date(),
      })
    );
  });

  // Test E: Citizen changes notification message -> DENIED
  it('Test E: denies Citizen A from modifying notification message body', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'notifications', notifAId), {
        message: 'Forged notification text',
      })
    );
  });

  // Test F: Citizen changes recipientId -> DENIED
  it('Test F: denies Citizen A from altering recipientId', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'notifications', notifAId), {
        recipientId: citizenB,
      })
    );
  });

  // Test G: Citizen changes createdBy -> DENIED
  it('Test G: denies Citizen A from altering createdBy field', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'notifications', notifAId), {
        createdBy: citizenA,
      })
    );
  });

  // Test H: Citizen creates notification for another user -> DENIED
  it('Test H: denies Citizen A from creating a notification for Citizen B', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'notifications', 'forged-notif'), {
        recipientId: citizenB,
        title: 'Forged Citizen Alert',
        message: 'Test',
        notificationType: 'SYSTEM_NOTICE',
        priority: 'LOW',
        isRead: false,
        createdBy: citizenA,
        createdAt: new Date(),
      })
    );
  });

  // Test I: Volunteer creates notification for another user -> DENIED
  it('Test I: denies Volunteer from creating notifications for citizens', async () => {
    const dbVol = testEnv.authenticatedContext(volunteerUid).firestore();
    await assertFails(
      setDoc(doc(dbVol, 'notifications', 'vol-notif'), {
        recipientId: citizenA,
        title: 'Volunteer Notification',
        message: 'Test',
        notificationType: 'VOLUNTEER_ASSIGNMENT',
        priority: 'MEDIUM',
        isRead: false,
        createdBy: volunteerUid,
        createdAt: new Date(),
      })
    );
  });

  // Test J: Admin creates targeted notification -> ALLOWED
  it('Test J: allows Admin to create targeted notification for Citizen A', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(
      setDoc(doc(adminDb, 'notifications', 'valid-admin-notif'), {
        recipientId: citizenA,
        title: 'Official Evacuation Advisory',
        message: 'Please move to nearest safe location',
        notificationType: 'DISASTER_ALERT',
        relatedEntityType: 'SAFE_LOCATION',
        relatedEntityId: 'shelter-001',
        priority: 'CRITICAL',
        isRead: false,
        createdBy: adminUid,
        createdAt: new Date(),
        readAt: null,
      })
    );
  });

  // Test K: Citizen attempts to modify priority -> DENIED
  it('Test K: denies Citizen A from modifying priority level on notification', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'notifications', notifAId), {
        priority: 'CRITICAL',
      })
    );
  });

  // Test L: Citizen attempts to modify createdAt -> DENIED
  it('Test L: denies Citizen A from altering createdAt timestamp', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'notifications', notifAId), {
        createdAt: new Date('2020-01-01'),
      })
    );
  });

  // Test M: Related record protection verification
  it('Test M: protects referenced related records with their own collection rules', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    // Notification for Citizen A points to request-123. Attempting to read another user's private request remains DENIED.
    await assertFails(getDoc(doc(dbA, 'emergencyRequests', 'other-user-private-request')));
  });
});
