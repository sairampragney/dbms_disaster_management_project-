import { describe, it, expect } from 'vitest';
import { DISASTER_TYPE_LABELS } from '../types/alert';

describe('Disaster Alert Model Utilities', () => {
  it('formats disaster type labels correctly for Indian context', () => {
    expect(DISASTER_TYPE_LABELS['FLOOD']).toBe('Flood');
    expect(DISASTER_TYPE_LABELS['URBAN_FLOODING']).toBe('Urban Flooding');
    expect(DISASTER_TYPE_LABELS['CYCLONE']).toBe('Cyclone');
    expect(DISASTER_TYPE_LABELS['HEAVY_RAINFALL']).toBe('Heavy Rainfall');
    expect(DISASTER_TYPE_LABELS['HEATWAVE']).toBe('Heatwave');
  });

  it('validates coordinates range helper', () => {
    const isValidCoordinates = (lat?: number, lng?: number) => {
      if (lat === undefined || lng === undefined) return true;
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    };

    expect(isValidCoordinates(17.3850, 78.4867)).toBe(true); // Hyderabad
    expect(isValidCoordinates(100, 78.4867)).toBe(false);
    expect(isValidCoordinates(17.3850, 200)).toBe(false);
  });

  it('filters active alerts based on expiry timestamp', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 86400000);
    const pastDate = new Date(now.getTime() - 86400000);

    const isAlertActive = (status: string, expiresAt: Date) => {
      return status === 'ACTIVE' && expiresAt.getTime() > now.getTime();
    };

    expect(isAlertActive('ACTIVE', futureDate)).toBe(true);
    expect(isAlertActive('ACTIVE', pastDate)).toBe(false);
    expect(isAlertActive('RESOLVED', futureDate)).toBe(false);
  });
});
