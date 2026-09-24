import { describe, it, expect } from 'vitest';

export const validateRegistration = (data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  pincode: string;
}) => {
  if (!data.fullName.trim()) return 'Full Name is required.';
  if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) return 'Please enter a valid email address.';
  if (!data.phone.trim() || !/^\+?91?[6-9]\d{9}$/.test(data.phone.replace(/[\s-]/g, ''))) {
    return 'Please enter a valid 10-digit Indian phone number (e.g., +91 98765 43210).';
  }
  if (data.password.length < 6) return 'Password must be at least 6 characters long.';
  if (data.password !== data.confirmPassword) return 'Passwords do not match.';
  if (!data.pincode.trim() || !/^\d{6}$/.test(data.pincode.trim())) {
    return 'Please enter a valid 6-digit PIN Code (e.g., 500072).';
  }
  return null;
};

describe('Registration Form Validation', () => {
  it('passes with valid Indian citizen registration details', () => {
    const validData = {
      fullName: 'Suresh Kumar',
      email: 'suresh@example.in',
      phone: '+91 98765 43210',
      password: 'securepassword123',
      confirmPassword: 'securepassword123',
      pincode: '500072',
    };
    expect(validateRegistration(validData)).toBeNull();
  });

  it('rejects invalid email formats', () => {
    const invalidEmail = {
      fullName: 'Suresh Kumar',
      email: 'invalid-email',
      phone: '+91 98765 43210',
      password: 'securepassword123',
      confirmPassword: 'securepassword123',
      pincode: '500072',
    };
    expect(validateRegistration(invalidEmail)).toBe('Please enter a valid email address.');
  });

  it('rejects invalid phone numbers', () => {
    const invalidPhone = {
      fullName: 'Suresh Kumar',
      email: 'suresh@example.in',
      phone: '12345',
      password: 'securepassword123',
      confirmPassword: 'securepassword123',
      pincode: '500072',
    };
    expect(validateRegistration(invalidPhone)).toBe(
      'Please enter a valid 10-digit Indian phone number (e.g., +91 98765 43210).'
    );
  });

  it('rejects password mismatches', () => {
    const mismatchPassword = {
      fullName: 'Suresh Kumar',
      email: 'suresh@example.in',
      phone: '+91 98765 43210',
      password: 'password123',
      confirmPassword: 'password456',
      pincode: '500072',
    };
    expect(validateRegistration(mismatchPassword)).toBe('Passwords do not match.');
  });

  it('rejects invalid PIN codes', () => {
    const invalidPin = {
      fullName: 'Suresh Kumar',
      email: 'suresh@example.in',
      phone: '+91 98765 43210',
      password: 'password123',
      confirmPassword: 'password123',
      pincode: '5000',
    };
    expect(validateRegistration(invalidPin)).toBe('Please enter a valid 6-digit PIN Code (e.g., 500072).');
  });
});
