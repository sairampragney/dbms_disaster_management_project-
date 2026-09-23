import { describe, it, expect } from 'vitest';
import { INCIDENT_TYPE_LABELS, IncidentStatus } from '../types/incident';

describe('Incident Utilities & Status Workflow Helpers', () => {
  it('maps incident types to human-friendly Indian labels', () => {
    expect(INCIDENT_TYPE_LABELS['URBAN_FLOODING']).toBe('Urban Flooding');
    expect(INCIDENT_TYPE_LABELS['HEAVY_RAINFALL']).toBe('Heavy Rainfall');
    expect(INCIDENT_TYPE_LABELS['LANDSLIDE']).toBe('Landslide');
  });

  it('validates status transitions according to Phase 5 rules', () => {
    const isValidTransition = (current: IncidentStatus, next: IncidentStatus): boolean => {
      const allowed: Record<IncidentStatus, IncidentStatus[]> = {
        REPORTED: ['VERIFIED', 'DISMISSED'],
        VERIFIED: ['IN_PROGRESS', 'DISMISSED'],
        IN_PROGRESS: ['RESOLVED'],
        RESOLVED: [],
        DISMISSED: [],
      };
      return allowed[current].includes(next);
    };

    expect(isValidTransition('REPORTED', 'VERIFIED')).toBe(true);
    expect(isValidTransition('REPORTED', 'DISMISSED')).toBe(true);
    expect(isValidTransition('REPORTED', 'RESOLVED')).toBe(false); // Citizens/admins cannot jump REPORTED -> RESOLVED directly
    expect(isValidTransition('VERIFIED', 'IN_PROGRESS')).toBe(true);
    expect(isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
  });
});
