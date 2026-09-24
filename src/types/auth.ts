import { Timestamp } from 'firebase/firestore';

export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isActive: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type AuthStateStatus = 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'INACTIVE' | 'ERROR';
