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

describe('Firestore Security Rules - Volunteers & Community Response (Tests A - R)', () => {
  const citizenA = 'citizen-a-uid';
  const citizenB = 'citizen-b-uid';
  const approvedVolA = 'approved-vol-a-uid';
  const approvedVolB = 'approved-vol-b-uid';
  const suspendedVol = 'suspended-vol-uid';
  const adminUid = 'admin-user-uid';

  const assignedReqId = 'request-assigned-to-vol-a';
  const unassignedReqId = 'request-unassigned-001';

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // Users
      await setDoc(doc(db, 'users', citizenA), { uid: citizenA, role: 'CITIZEN', isActive: true });
      await setDoc(doc(db, 'users', citizenB), { uid: citizenB, role: 'CITIZEN', isActive: true });
      await setDoc(doc(db, 'users', approvedVolA), { uid: approvedVolA, role: 'VOLUNTEER', isActive: true });
      await setDoc(doc(db, 'users', approvedVolB), { uid: approvedVolB, role: 'VOLUNTEER', isActive: true });
      await setDoc(doc(db, 'users', suspendedVol), { uid: suspendedVol, role: 'CITIZEN', isActive: true });
      await setDoc(doc(db, 'users', adminUid), { uid: adminUid, role: 'ADMIN', isActive: true });

      // Volunteer Profiles
      await setDoc(doc(db, 'volunteers', approvedVolA), {
        userId: approvedVolA,
        fullName: 'Approved Volunteer A',
        phone: '+919876543210',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['FIRST_AID'],
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'APPROVED',
        isActive: true,
        approvedBy: adminUid,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await setDoc(doc(db, 'volunteers', approvedVolB), {
        userId: approvedVolB,
        fullName: 'Approved Volunteer B',
        phone: '+919876543211',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['FOOD_DISTRIBUTION'],
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'APPROVED',
        isActive: true,
        approvedBy: adminUid,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await setDoc(doc(db, 'volunteers', suspendedVol), {
        userId: suspendedVol,
        fullName: 'Suspended Volunteer',
        phone: '+919876543212',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['RESCUE'],
        availabilityStatus: 'UNAVAILABLE',
        verificationStatus: 'SUSPENDED',
        isActive: false,
        approvedBy: adminUid,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Emergency Requests
      await setDoc(doc(db, 'emergencyRequests', assignedReqId), {
        requesterId: citizenA,
        title: 'Emergency Medical Transport Needed',
        description: 'First aid required immediately',
        requestType: 'MEDICAL_ASSISTANCE',
        priority: 'CRITICAL',
        location: 'Begumpet',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500016',
        status: 'ASSIGNED',
        assignedVolunteerId: approvedVolA,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        resolutionNotes: null,
      });

      await setDoc(doc(db, 'emergencyRequests', unassignedReqId), {
        requesterId: citizenB,
        title: 'Food Packets Needed',
        description: 'For 5 displaced persons',
        requestType: 'FOOD_WATER',
        priority: 'MEDIUM',
        location: 'Kukatpally',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        status: 'ACKNOWLEDGED',
        assignedVolunteerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        resolutionNotes: null,
      });
    });
  });

  // Test A: Citizen creates their own volunteer application -> ALLOWED
  it('Test A: allows Citizen A to create their own volunteer application matching auth UID', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertSucceeds(
      setDoc(doc(dbA, 'volunteers', citizenA), {
        userId: citizenA,
        fullName: 'Citizen A',
        phone: '+919876543213',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['FIRST_AID'],
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'PENDING',
        isActive: false,
        approvedBy: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
  });

  // Test B: Citizen tries to create a volunteer profile using another UID -> DENIED
  it('Test B: denies Citizen A from creating a volunteer profile using Citizen B UID', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'volunteers', citizenB), {
        userId: citizenB,
        fullName: 'Citizen B',
        phone: '+919876543214',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['FIRST_AID'],
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'PENDING',
        isActive: false,
        approvedBy: null,
        approvedAt: null,
      })
    );
  });

  // Test C: Citizen tries to set verificationStatus = APPROVED -> DENIED
  it('Test C: denies Citizen A from self-assigning verificationStatus = APPROVED', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'volunteers', citizenA), {
        userId: citizenA,
        fullName: 'Citizen A',
        phone: '+919876543213',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['FIRST_AID'],
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'APPROVED',
        isActive: true,
        approvedBy: citizenA,
        approvedAt: new Date(),
      })
    );
  });

  // Test D: Citizen tries to set isActive = true for volunteer approval -> DENIED
  it('Test D: denies Citizen A from forging isActive = true on application', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(
      setDoc(doc(dbA, 'volunteers', citizenA), {
        userId: citizenA,
        fullName: 'Citizen A',
        phone: '+919876543213',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        skills: ['FIRST_AID'],
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'PENDING',
        isActive: true,
        approvedBy: null,
        approvedAt: null,
      })
    );
  });

  // Test E: Citizen A attempts to edit Citizen B's volunteer profile -> DENIED
  it('Test E: denies Citizen A from reading or updating Citizen B volunteer profile', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(getDoc(doc(dbA, 'volunteers', approvedVolB)));
    await assertFails(
      updateDoc(doc(dbA, 'volunteers', approvedVolB), {
        phone: '+910000000000',
      })
    );
  });

  // Test F: Admin approves a volunteer -> ALLOWED
  it('Test F: allows admin to approve a volunteer profile', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(
      updateDoc(doc(adminDb, 'volunteers', approvedVolA), {
        verificationStatus: 'APPROVED',
        isActive: true,
        approvedBy: adminUid,
        approvedAt: new Date(),
      })
    );
  });

  // Test G: Admin suspends a volunteer -> ALLOWED
  it('Test G: allows admin to suspend a volunteer profile', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(
      updateDoc(doc(adminDb, 'volunteers', approvedVolB), {
        verificationStatus: 'SUSPENDED',
        isActive: false,
      })
    );
  });

  // Test H: Suspended volunteer attempts to access volunteer response tasks -> DENIED
  it('Test H: denies suspended volunteer from reading emergency tasks assigned to others or unapproved tasks', async () => {
    const dbSusp = testEnv.authenticatedContext(suspendedVol).firestore();
    await assertFails(getDoc(doc(dbSusp, 'emergencyRequests', unassignedReqId)));
  });

  // Test I: Approved Volunteer A attempts to read Volunteer B's private profile -> DENIED
  it('Test I: denies Approved Volunteer A from reading Volunteer B private profile', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertFails(getDoc(doc(dbVolA, 'volunteers', approvedVolB)));
  });

  // Test J: Volunteer attempts to read an unrelated emergency request -> DENIED
  it('Test J: denies Approved Volunteer A from reading an unassigned emergency request', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertFails(getDoc(doc(dbVolA, 'emergencyRequests', unassignedReqId)));
  });

  // Test K: Volunteer attempts to modify assignedVolunteerId -> DENIED
  it('Test K: denies Volunteer A from altering assignedVolunteerId on an assigned task', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertFails(
      updateDoc(doc(dbVolA, 'emergencyRequests', assignedReqId), {
        assignedVolunteerId: approvedVolB,
      })
    );
  });

  // Test L: Volunteer attempts to assign themselves to an arbitrary request -> DENIED
  it('Test L: denies Volunteer A from assigning themselves to an unassigned request', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertFails(
      updateDoc(doc(dbVolA, 'emergencyRequests', unassignedReqId), {
        assignedVolunteerId: approvedVolA,
      })
    );
  });

  // Test M: Volunteer attempts to resolve an arbitrary request -> DENIED
  it('Test M: denies Volunteer A from modifying resolutionNotes or marking status RESOLVED', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertFails(
      updateDoc(doc(dbVolA, 'emergencyRequests', assignedReqId), {
        status: 'RESOLVED',
        resolutionNotes: 'Self resolved by volunteer',
      })
    );
  });

  // Test N: Volunteer attempts to change another user's emergency request -> DENIED
  it('Test N: denies Volunteer A from altering requesterId on assigned request', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertFails(
      updateDoc(doc(dbVolA, 'emergencyRequests', assignedReqId), {
        requesterId: citizenB,
      })
    );
  });

  // Test O: Citizen attempts to assign themselves as volunteer -> DENIED
  it('Test O: denies Citizen B from setting assignedVolunteerId to themselves', async () => {
    const dbB = testEnv.authenticatedContext(citizenB).firestore();
    await assertFails(
      updateDoc(doc(dbB, 'emergencyRequests', unassignedReqId), {
        assignedVolunteerId: citizenB,
      })
    );
  });

  // Test P: Citizen attempts to access volunteer tasks without approval -> DENIED
  it('Test P: denies Citizen A from reading unassigned emergency requests', async () => {
    const dbA = testEnv.authenticatedContext(citizenA).firestore();
    await assertFails(getDoc(doc(dbA, 'emergencyRequests', unassignedReqId)));
  });

  // Test Q: Admin assigns an approved active volunteer -> ALLOWED
  it('Test Q: allows Admin to assign an approved active volunteer to a request', async () => {
    const adminDb = testEnv.authenticatedContext(adminUid).firestore();
    await assertSucceeds(
      updateDoc(doc(adminDb, 'emergencyRequests', unassignedReqId), {
        assignedVolunteerId: approvedVolA,
        status: 'ASSIGNED',
      })
    );
  });

  // Test R: Volunteer A reads and updates assigned response state -> ALLOWED
  it('Test R: allows Approved Volunteer A to read their assigned request and mark IN_PROGRESS', async () => {
    const dbVolA = testEnv.authenticatedContext(approvedVolA).firestore();
    await assertSucceeds(getDoc(doc(dbVolA, 'emergencyRequests', assignedReqId)));
    await assertSucceeds(
      updateDoc(doc(dbVolA, 'emergencyRequests', assignedReqId), {
        status: 'IN_PROGRESS',
      })
    );
  });
});
