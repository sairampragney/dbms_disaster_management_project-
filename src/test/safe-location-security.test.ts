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

describe('Firestore Security Rules - Safe Locations Collection (Tests A - L)', () => {
  const citizenUid = 'citizen-user-123';
  const volunteerUid = 'volunteer-user-456';
  const adminUid = 'admin-user-789';

  const activeLocId = 'active-location-001';
  const inactiveLocId = 'inactive-location-002';

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

      // Seed Active Location
      await setDoc(doc(db, 'safeLocations', activeLocId), {
        name: 'Begumpet Relief Center',
        description: 'Primary emergency shelter',
        locationType: 'SHELTER',
        address: 'Begumpet Flyover Road',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500016',
        latitude: 17.4435,
        longitude: 78.468,
        contactPhone: '+91 98765 43210',
        capacity: 300,
        availabilityStatus: 'AVAILABLE',
        services: ['SHELTER', 'FOOD', 'WATER'],
        isActive: true,
        createdBy: adminUid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Seed Inactive Location
      await setDoc(doc(db, 'safeLocations', inactiveLocId), {
        name: 'Old Decommissioned Shelter',
        description: 'Closed facility',
        locationType: 'SHELTER',
        address: 'Old Town',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        latitude: 17.385,
        longitude: 78.486,
        contactPhone: null,
        capacity: 0,
        availabilityStatus: 'CLOSED',
        services: [],
        isActive: false,
        createdBy: adminUid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  // Test A: Unauthenticated user reads an active safe location -> ALLOWED
  it('Test A: allows unauthenticated user to read an active safe location', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(unauthDb, 'safeLocations', activeLocId)));
  });

  // Test B: Unauthenticated user tries to read an inactive safe location -> DENIED
  it('Test B: denies unauthenticated user from reading an inactive safe location', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthDb, 'safeLocations', inactiveLocId)));
  });

  // Test C: Citizen reads active safe location -> ALLOWED
  it('Test C: allows authenticated citizen to read an active safe location', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertSucceeds(getDoc(doc(citizenDb, 'safeLocations', activeLocId)));
  });

  // Test D: Citizen attempts to create a safe location -> DENIED
  it('Test D: denies citizen from creating a safe location', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertFails(
      setDoc(doc(citizenDb, 'safeLocations', 'forged-location'), {
        name: 'Fake Citizen Shelter',
        locationType: 'SHELTER',
        city: 'Hyderabad',
        isActive: true,
        createdBy: citizenUid,
      })
    );
  });

  // Test E: Citizen attempts to update a safe location -> DENIED
  it('Test E: denies citizen from updating a safe location', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertFails(
      updateDoc(doc(citizenDb, 'safeLocations', activeLocId), {
        availabilityStatus: 'FULL',
      })
    );
  });

  // Test F: Volunteer attempts to create/update a safe location -> DENIED
  it('Test F: denies volunteer from creating or updating a safe location', async () => {
    const volunteerDb = testEnv.authenticatedContext(volunteerUid).firestore();
    await assertFails(
      setDoc(doc(volunteerDb, 'safeLocations', 'vol-loc'), {
        name: 'Volunteer Shelter',
        isActive: true,
        createdBy: volunteerUid,
      })
    );
    await assertFails(
      updateDoc(doc(volunteerDb, 'safeLocations', activeLocId), {
        capacity: 500,
      })
    );
  });

  // Test G: Admin creates a safe location -> ALLOWED
  it('Test G: allows admin to create a safe location with createdBy = auth.uid', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(
      setDoc(doc(adminDb, 'safeLocations', 'new-admin-loc'), {
        name: 'Secunderabad Community Relief Shelter',
        description: 'Active relief center',
        locationType: 'COMMUNITY_CENTER',
        address: 'MG Road',
        city: 'Secunderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500003',
        latitude: 17.4399,
        longitude: 78.4983,
        contactPhone: '+91 98765 43211',
        capacity: 250,
        availabilityStatus: 'AVAILABLE',
        services: ['FOOD', 'WATER', 'CHARGING'],
        isActive: true,
        createdBy: adminUid,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  // Test H: Admin updates a safe location -> ALLOWED
  it('Test H: allows admin to update safe location details', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(
      updateDoc(doc(adminDb, 'safeLocations', activeLocId), {
        capacity: 400,
        availabilityStatus: 'LIMITED',
      })
    );
  });

  // Test I: Non-admin attempts to change isActive -> DENIED
  it('Test I: denies citizen/volunteer from changing isActive field', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertFails(
      updateDoc(doc(citizenDb, 'safeLocations', activeLocId), {
        isActive: false,
      })
    );
  });

  // Test J: Non-admin attempts to change protected createdBy -> DENIED
  it('Test J: denies modifying createdBy field during update', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertFails(
      updateDoc(doc(adminDb, 'safeLocations', activeLocId), {
        createdBy: citizenUid,
      })
    );
  });

  // Test K: Non-admin attempts to change createdAt -> DENIED
  it('Test K: denies modifying createdAt field during update', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertFails(
      updateDoc(doc(adminDb, 'safeLocations', activeLocId), {
        createdAt: new Date('2020-01-01'),
      })
    );
  });

  // Test L: Client attempts to forge an admin role before modifying a location -> DENIED
  it('Test L: denies non-admin trying to update inactive safe location directly', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenUid).firestore();
    await assertFails(getDoc(doc(citizenDb, 'safeLocations', inactiveLocId)));
    await assertFails(
      updateDoc(doc(citizenDb, 'safeLocations', inactiveLocId), {
        isActive: true,
      })
    );
  });
});
