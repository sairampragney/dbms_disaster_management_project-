import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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

describe('Firestore Security Rules - Incidents Collection & IDOR Tests', () => {
  const citizenA = 'citizen-a-uid';
  const citizenB = 'citizen-b-uid';
  const adminUid = 'admin-uid-123';
  const incidentAId = 'incident-a-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // Seed Users
      await setDoc(doc(db, 'users', citizenA), {
        uid: citizenA,
        role: 'CITIZEN',
        isActive: true,
      });

      await setDoc(doc(db, 'users', citizenB), {
        uid: citizenB,
        role: 'CITIZEN',
        isActive: true,
      });

      await setDoc(doc(db, 'users', adminUid), {
        uid: adminUid,
        role: 'ADMIN',
        isActive: true,
      });

      // Seed Citizen A Incident
      await setDoc(doc(db, 'incidents', incidentAId), {
        reporterId: citizenA,
        title: 'Flooding in Begumpet',
        description: 'Water levels rising',
        incidentType: 'URBAN_FLOODING',
        severity: 'HIGH',
        location: 'Begumpet Flyover',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500016',
        status: 'REPORTED',
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedBy: null,
        verifiedAt: null,
        resolutionNotes: null,
        resolvedAt: null,
      });
    });
  });

  it('allows Citizen A to read their own incident report', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertSucceeds(getDoc(doc(dbA, 'incidents', incidentAId)));
  });

  it('denies Citizen B from reading Citizen A incident report (IDOR Protection Test A)', async () => {
    const dbB = testEnv.authenticatedContext(citizenB).firestore();
    await assertFails(getDoc(doc(dbB, 'incidents', incidentAId)));
  });

  it('denies Citizen B from updating Citizen A incident report (Test B)', async () => {
    const dbB = testEnv.authenticatedContext(citizenB).firestore();
    await assertFails(
      updateDoc(doc(dbB, 'incidents', incidentAId), {
        description: 'Forged text by Citizen B',
      })
    );
  });

  it('allows Citizen A to create an incident assigned to their own UID with status REPORTED', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertSucceeds(
      setDoc(doc(dbA, 'incidents', 'new-inc-a'), {
        reporterId: citizenA,
        title: 'Landslide in Warangal',
        description: 'Debris blocking road',
        incidentType: 'LANDSLIDE',
        severity: 'MEDIUM',
        location: 'Hunter Road',
        city: 'Warangal',
        district: 'Warangal',
        state: 'Telangana',
        pincode: '506001',
        status: 'REPORTED',
        verifiedBy: null,
        verifiedAt: null,
        resolutionNotes: null,
        resolvedAt: null,
      })
    );
  });

  it('denies Citizen A from creating an incident with reporterId set to Citizen B (Test C)', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'incidents', 'forged-reporter'), {
        reporterId: citizenB,
        title: 'Forged Incident',
        description: 'Test',
        status: 'REPORTED',
      })
    );
  });

  it('denies Citizen A from setting initial status to RESOLVED or VERIFIED (Test D)', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'incidents', 'forged-status'), {
        reporterId: citizenA,
        title: 'Forged Status',
        description: 'Test',
        status: 'RESOLVED',
      })
    );
  });

  it('denies Citizen A from forging verifiedBy or verifiedAt metadata (Test E)', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'incidents', incidentAId), {
        verifiedBy: citizenA,
        verifiedAt: new Date(),
      })
    );
  });

  it('denies Citizen A from forging resolutionNotes or resolvedAt (Test F)', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'incidents', incidentAId), {
        resolutionNotes: 'Artificially resolved by citizen',
        resolvedAt: new Date(),
      })
    );
  });

  it('allows Admin to read, verify, and resolve any citizen incident', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(getDoc(doc(adminDb, 'incidents', incidentAId)));
    await assertSucceeds(
      updateDoc(doc(adminDb, 'incidents', incidentAId), {
        status: 'VERIFIED',
        verifiedBy: adminUid,
        verifiedAt: new Date(),
      })
    );
  });

  it('denies citizen from deleting incident records', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(deleteDoc(doc(dbA, 'incidents', incidentAId)));
  });
});
