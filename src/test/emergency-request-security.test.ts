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

describe('Firestore Security Rules - Emergency Requests Collection (Tests A - K)', () => {
  const citizenA = 'citizen-a-123';
  const citizenB = 'citizen-b-456';
  const volunteerUid = 'volunteer-789';
  const adminUid = 'admin-999';

  const requestAId = 'request-a-001';

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

      // Seed Citizen A Request
      await setDoc(doc(db, 'emergencyRequests', requestAId), {
        requesterId: citizenA,
        title: 'Need Drinking Water Supplies',
        description: 'Clean water required for 4 family members in Banjara Hills',
        requestType: 'FOOD_WATER',
        priority: 'HIGH',
        location: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        latitude: 17.4126,
        longitude: 78.4482,
        status: 'PENDING',
        assignedVolunteerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        resolutionNotes: null,
      });
    });
  });

  // Test A: Citizen A creates Request A. Citizen B tries to read Request A -> DENIED
  it('Test A: denies Citizen B from reading Citizen A request', async () => {
    const dbB = testEnv.authenticatedContext(citizenB).firestore();
    await assertFails(getDoc(doc(dbB, 'emergencyRequests', requestAId)));
  });

  // Test B: Citizen B attempts to update Request A -> DENIED
  it('Test B: denies Citizen B from updating Citizen A request', async () => {
    const dbB = testEnv.authenticatedContext(citizenB).firestore();
    await assertFails(
      updateDoc(doc(dbB, 'emergencyRequests', requestAId), {
        description: 'Tampered by Citizen B',
      })
    );
  });

  // Test C: Citizen attempts to change requesterId -> DENIED
  it('Test C: denies citizen from forging requesterId on request creation/update', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'emergencyRequests', 'forged-requester'), {
        requesterId: citizenB,
        title: 'Forged Requester',
        description: 'Test',
        requestType: 'FOOD_WATER',
        priority: 'MEDIUM',
        location: 'Hyderabad',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        status: 'PENDING',
        assignedVolunteerId: null,
        resolvedAt: null,
        resolutionNotes: null,
      })
    );
  });

  // Test D: Citizen attempts to change assignedVolunteerId -> DENIED
  it('Test D: denies citizen from setting or updating assignedVolunteerId', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'emergencyRequests', 'forged-volunteer'), {
        requesterId: citizenA,
        title: 'Request with assigned volunteer',
        description: 'Test',
        requestType: 'MEDICAL_ASSISTANCE',
        priority: 'HIGH',
        location: 'Hyderabad',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        status: 'PENDING',
        assignedVolunteerId: volunteerUid,
        resolvedAt: null,
        resolutionNotes: null,
      })
    );
  });

  // Test E: Citizen attempts status = RESOLVED -> DENIED
  it('Test E: denies citizen from setting status directly to RESOLVED', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'emergencyRequests', requestAId), {
        status: 'RESOLVED',
      })
    );
  });

  // Test F: Citizen attempts to modify resolutionNotes / resolvedAt -> DENIED
  it('Test F: denies citizen from forging resolutionNotes or resolvedAt', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'emergencyRequests', requestAId), {
        resolutionNotes: 'Self resolved',
        resolvedAt: new Date(),
      })
    );
  });

  // Test G: Citizen attempts to modify protected timestamps -> DENIED
  it('Test G: denies citizen from altering createdAt timestamp', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'emergencyRequests', requestAId), {
        status: 'CANCELLED',
        createdAt: new Date('2020-01-01'),
      })
    );
  });

  // Test H: Non-admin tries to assign a volunteer -> DENIED
  it('Test H: denies non-admin from assigning a volunteer', async () => {
    const dbVol = testEnv.authenticatedContext(volunteerUid).firestore();
    await assertFails(
      updateDoc(doc(dbVol, 'emergencyRequests', requestAId), {
        assignedVolunteerId: volunteerUid,
        status: 'ASSIGNED',
      })
    );
  });

  // Test I: Non-admin tries to acknowledge a request -> DENIED
  it('Test I: denies non-admin from setting status to ACKNOWLEDGED', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'emergencyRequests', requestAId), {
        status: 'ACKNOWLEDGED',
      })
    );
  });

  // Test J: Volunteer tries to access an unrelated private request without explicit assignment -> DENIED
  it('Test J: denies unassigned volunteer from reading private citizen request', async () => {
    const dbVol = testEnv.authenticatedContext(volunteerUid).firestore();
    await assertFails(getDoc(doc(dbVol, 'emergencyRequests', requestAId)));
  });

  // Test K: Citizen attempts an invalid status transition (e.g. CANCELLED -> PENDING) -> DENIED
  it('Test K: denies invalid status transition by citizen', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      updateDoc(doc(dbA, 'emergencyRequests', requestAId), {
        status: 'IN_PROGRESS',
      })
    );
  });

  // Valid Flow Test: Citizen creates request & cancels it while allowed; Admin acknowledges and assigns volunteer
  it('allows Citizen A to create and cancel request; allows Admin full workflow access', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();

    // Citizen A creates request
    await assertSucceeds(
      setDoc(doc(dbA, 'emergencyRequests', 'valid-req-1'), {
        requesterId: citizenA,
        title: 'Evacuation Assistance',
        description: 'Water rising rapidly',
        requestType: 'EVACUATION',
        priority: 'CRITICAL',
        location: 'Begumpet',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500016',
        latitude: null,
        longitude: null,
        status: 'PENDING',
        assignedVolunteerId: null,
        resolvedAt: null,
        resolutionNotes: null,
      })
    );

    // Citizen A cancels own request while PENDING
    await assertSucceeds(
      updateDoc(doc(dbA, 'emergencyRequests', 'valid-req-1'), {
        status: 'CANCELLED',
      })
    );

    // Admin acknowledges and assigns volunteer on Request A
    const dbAdmin = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(getDoc(doc(dbAdmin, 'emergencyRequests', requestAId)));
    await assertSucceeds(
      updateDoc(doc(dbAdmin, 'emergencyRequests', requestAId), {
        status: 'ACKNOWLEDGED',
      })
    );
    await assertSucceeds(
      updateDoc(doc(dbAdmin, 'emergencyRequests', requestAId), {
        assignedVolunteerId: volunteerUid,
        status: 'ASSIGNED',
      })
    );
  });
});
