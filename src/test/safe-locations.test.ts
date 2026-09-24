import { describe, it, expect } from 'vitest';
import {
  LOCATION_TYPE_LABELS,
  AVAILABILITY_STATUS_LABELS,
  LOCATION_SERVICE_LABELS,
  getDirectionsUrl,
} from '../types/safeLocation';

describe('Safe Location Utilities & Helpers', () => {
  it('maps facility types and availability statuses to human-friendly labels', () => {
    expect(LOCATION_TYPE_LABELS['SHELTER']).toBe('Emergency Shelter');
    expect(LOCATION_TYPE_LABELS['HOSPITAL']).toBe('Hospital / Medical Center');
    expect(AVAILABILITY_STATUS_LABELS['AVAILABLE']).toBe('Available (Accepting People)');
    expect(AVAILABILITY_STATUS_LABELS['FULL']).toBe('Full Capacity');
    expect(LOCATION_SERVICE_LABELS['FOOD']).toBe('Meals & Food Supplies');
  });

  it('generates valid Google Maps directions URL with coordinates', () => {
    const url = getDirectionsUrl(17.385, 78.4867, 'Begumpet', 'Hyderabad', 'Telangana');
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=17.385,78.4867');
  });

  it('falls back to address string if coordinates are null or invalid', () => {
    const url = getDirectionsUrl(null, null, 'MG Road', 'Secunderabad', 'Telangana');
    expect(url).toContain('https://www.google.com/maps/search/?api=1&query=MG%20Road');
  });
});
