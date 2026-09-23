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

describe('Firestore Security Rules - Alerts Collection', () => {
  const citizenUid = 'citizen-user-123';
  const volunteerUid = 'volunteer-user-456';
  const adminUid = 'admin-user-789';
  const publicAlertId = 'public-alert-001';
  const privateAlertId = 'private-alert-002';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // Seed Users
      await setDoc(doc(db, 'users', citizenUid), {
        uid: citizenUid,
        role: 'CITIZEN',
        isActive: true,
      });

      await setDoc(doc(db, 'users', volunteerUid), {
        uid: volunteerUid,
        role: 'VOLUNTEER',
        isActive: true,
      });

      await setDoc(doc(db, 'users', adminUid), {
        uid: adminUid,
        role: 'ADMIN',
        isActive: true,
      });

      // Seed Alerts
      await setDoc(doc(db, 'alerts', publicAlertId), {
        title: 'Heavy Rainfall Warning - Hyderabad',
        isPublic: true,
        status: 'ACTIVE',
        severity: 'HIGH',
        createdBy: adminUid,
      });

      await setDoc(doc(db, 'alerts', privateAlertId), {
        title: 'Internal Admin Advisory',
        isPublic: false,
        status: 'ACTIVE',
        severity: 'LOW',
        createdBy: adminUid,
      });
    });
  });

  it('allows anonymous user to read public alert', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(unauthDb, 'alerts', publicAlertId)));
  });

  it('denies anonymous user from reading private alert', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthDb, 'alerts', privateAlertId)));
  });

  it('denies citizen from creating alerts', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertFails(
      setDoc(doc(citizenDb, 'alerts', 'forged-alert'), {
        title: 'Fake Disaster Alert',
        isPublic: true,
        createdBy: citizenUid,
      })
    );
  });

  it('denies citizen from updating alert severity or status', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertFails(
      updateDoc(doc(citizenDb, 'alerts', publicAlertId), {
        severity: 'CRITICAL',
      })
    );
  });

  it('denies volunteer from creating or editing alerts', async () => {
    const volunteerDb = testEnv.authenticatedContext(volunteerUid).firestore();
    await assertFails(
      setDoc(doc(volunteerDb, 'alerts', 'vol-alert'), {
        title: 'Volunteer Alert',
        isPublic: true,
        createdBy: volunteerUid,
      })
    );
    await assertFails(
      updateDoc(doc(volunteerDb, 'alerts', publicAlertId), {
        status: 'RESOLVED',
      })
    );
  });

  it('allows admin to create, edit, and resolve alerts', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();

    await assertSucceeds(
      setDoc(doc(adminDb, 'alerts', 'new-admin-alert'), {
        title: 'Urban Flooding Warning',
        isPublic: true,
        severity: 'CRITICAL',
        createdBy: adminUid,
      })
    );

    await assertSucceeds(
      updateDoc(doc(adminDb, 'alerts', publicAlertId), {
        status: 'RESOLVED',
        isPublic: true,
        severity: 'HIGH',
        createdBy: adminUid,
        title: 'Heavy Rainfall Warning - Hyderabad',
      })
    );
  });
});
