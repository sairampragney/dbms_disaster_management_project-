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

describe('Firestore Security Rules - Users Collection', () => {
  const citizenA = { uid: 'citizen-a-123', email: 'citizena@example.in' };
  const citizenB = { uid: 'citizen-b-456', email: 'citizenb@example.in' };
  const adminUser = { uid: 'admin-789', email: 'admin@example.in' };

  beforeEach(async () => {
    // Seed initial Firestore state using admin Context
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', citizenA.uid), {
        uid: citizenA.uid,
        fullName: 'Citizen A',
        email: citizenA.email,
        phone: '+919876543210',
        role: 'CITIZEN',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        isActive: true,
        createdAt: new Date(),
      });

      await setDoc(doc(db, 'users', citizenB.uid), {
        uid: citizenB.uid,
        fullName: 'Citizen B',
        email: citizenB.email,
        phone: '+919876543211',
        role: 'CITIZEN',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        isActive: true,
        createdAt: new Date(),
      });

      await setDoc(doc(db, 'users', adminUser.uid), {
        uid: adminUser.uid,
        fullName: 'System Admin',
        email: adminUser.email,
        phone: '+919876543212',
        role: 'ADMIN',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        isActive: true,
        createdAt: new Date(),
      });
    });
  });

  it('denies anonymous read and write to users collection', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthDb, 'users', citizenA.uid)));
    await assertFails(
      setDoc(doc(unauthDb, 'users', 'new-anon-user'), {
        uid: 'new-anon-user',
        role: 'CITIZEN',
      })
    );
  });

  it('allows authenticated citizen to read their own profile', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertSucceeds(getDoc(doc(citizenDb, 'users', citizenA.uid)));
  });

  it('denies citizen from reading another user profile (IDOR protection)', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertFails(getDoc(doc(citizenDb, 'users', citizenB.uid)));
  });

  it('allows admin to read any user profile', async () => {
    const adminDb = testEnv.authenticatedContext(adminUser.uid).firestore();
    await assertSucceeds(getDoc(doc(adminDb, 'users', citizenA.uid)));
    await assertSucceeds(getDoc(doc(adminDb, 'users', citizenB.uid)));
  });

  it('allows citizen to update allowed profile fields (city, phone, pincode)', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertSucceeds(
      updateDoc(doc(citizenDb, 'users', citizenA.uid), {
        city: 'Secunderabad',
        pincode: '500003',
      })
    );
  });

  it('denies citizen privilege escalation (attempting role change to ADMIN)', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertFails(
      updateDoc(doc(citizenDb, 'users', citizenA.uid), {
        role: 'ADMIN',
      })
    );
  });

  it('denies citizen from modifying protected fields (uid, isActive, createdAt)', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertFails(
      updateDoc(doc(citizenDb, 'users', citizenA.uid), {
        isActive: false,
      })
    );
  });

  it('denies citizen from updating another user profile', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertFails(
      updateDoc(doc(citizenDb, 'users', citizenB.uid), {
        city: 'Secunderabad',
      })
    );
  });

  it('denies citizen from deleting user profiles', async () => {
    const citizenDb = testEnv.authenticatedContext(citizenA.uid).firestore();
    await assertFails(deleteDoc(doc(citizenDb, 'users', citizenB.uid)));
  });
});
