import { describe, it, expect } from 'vitest';
import {
  REQUEST_TYPE_LABELS,
  isValidRequestStatusTransition,
} from '../types/emergencyRequest';

describe('Emergency Request Utilities & Status Helpers', () => {
  it('maps request categories to human-friendly Indian labels', () => {
    expect(REQUEST_TYPE_LABELS['MEDICAL_ASSISTANCE']).toBe('Medical Assistance & First Aid');
    expect(REQUEST_TYPE_LABELS['FOOD_WATER']).toBe('Food & Drinking Water Supplies');
    expect(REQUEST_TYPE_LABELS['EVACUATION']).toBe('Emergency Evacuation');
  });

  it('validates allowed status transitions for emergency requests', () => {
    expect(isValidRequestStatusTransition('PENDING', 'ACKNOWLEDGED')).toBe(true);
    expect(isValidRequestStatusTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(isValidRequestStatusTransition('PENDING', 'RESOLVED')).toBe(false);

    expect(isValidRequestStatusTransition('ACKNOWLEDGED', 'ASSIGNED')).toBe(true);
    expect(isValidRequestStatusTransition('ACKNOWLEDGED', 'CANCELLED')).toBe(true);

    expect(isValidRequestStatusTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(isValidRequestStatusTransition('ASSIGNED', 'CANCELLED')).toBe(true);

    expect(isValidRequestStatusTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(isValidRequestStatusTransition('IN_PROGRESS', 'CANCELLED')).toBe(false);

    expect(isValidRequestStatusTransition('RESOLVED', 'PENDING')).toBe(false);
  });
});
