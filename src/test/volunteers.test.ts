import { describe, it, expect } from 'vitest';
import {
  VOLUNTEER_SKILL_LABELS,
  AVAILABILITY_LABELS,
  VERIFICATION_STATUS_LABELS,
} from '../types/volunteer';

describe('Volunteer Utilities & Skill Mappings', () => {
  it('maps skill keys to human-friendly labels', () => {
    expect(VOLUNTEER_SKILL_LABELS['MEDICAL_AID']).toBe('Medical Aid & Doctor Support');
    expect(VOLUNTEER_SKILL_LABELS['FIRST_AID']).toBe('First Aid & Paramedic Aid');
    expect(VOLUNTEER_SKILL_LABELS['FOOD_DISTRIBUTION']).toBe('Community Kitchen & Food Distribution');
  });

  it('maps availability and verification statuses correctly', () => {
    expect(AVAILABILITY_LABELS['AVAILABLE']).toBe('Available (Ready for Dispatch)');
    expect(AVAILABILITY_LABELS['BUSY']).toBe('Busy (On Active Assignment)');
    expect(VERIFICATION_STATUS_LABELS['APPROVED']).toBe('Approved Volunteer Responder');
    expect(VERIFICATION_STATUS_LABELS['PENDING']).toBe('Pending Administrative Verification');
  });
});
