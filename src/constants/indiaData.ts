/**
 * Centralized India Localization Data & Validation Helpers
 */

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export type IndianStateOrUT = typeof INDIAN_STATES_AND_UTS[number];

export const PRIMARY_DEMO_GEOGRAPHY = {
  city: 'Hyderabad',
  district: 'Hyderabad',
  state: 'Telangana',
  pincode: '500001',
} as const;

export const EMERGENCY_NUMBERS = {
  NATIONAL_EMERGENCY: '112',
  POLICE: '100',
  FIRE: '101',
  AMBULANCE: '108',
} as const;

/**
 * Validates 6-digit Indian PIN Code
 */
export function isValidPincode(pincode: string): boolean {
  if (!pincode) return false;
  const cleanPin = pincode.trim();
  return /^[1-9][0-9]{5}$/.test(cleanPin);
}

/**
 * Validates Indian Phone Number (10 digits starting with 6-9, optionally prefixed with +91 or 0)
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
  return /^(?:\+91|0)?[6-9]\d{9}$/.test(cleanPhone);
}

/**
 * Formats a raw 10-digit phone number string into Indian standard "+91 XXXXX XXXXX"
 */
export function formatIndianPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Formats date into DD/MM/YYYY string for Asia/Kolkata timezone
 */
export function formatIndianDate(date: Date | number | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(d);
}

/**
 * Formats date and time into "DD/MM/YYYY, HH:mm" (24-hour format) for Asia/Kolkata
 */
export function formatIndianDateTime(date: Date | number | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(d);
}
