import { describe, it, expect } from 'vitest';
import {
  NOTIFICATION_TYPE_LABELS,
  getRelatedEntityRoute,
} from '../types/notification';

describe('Notification Utilities & Route Mappings', () => {
  it('maps notification types to human-friendly labels', () => {
    expect(NOTIFICATION_TYPE_LABELS['DISASTER_ALERT']).toBe('Disaster Advisory Alert');
    expect(NOTIFICATION_TYPE_LABELS['VOLUNTEER_ASSIGNMENT']).toBe('Volunteer Dispatch Assignment');
  });

  it('generates correct routes based on entity type and user role', () => {
    expect(getRelatedEntityRoute('ALERT', 'alert-123')).toBe('/alerts/alert-123');
    expect(getRelatedEntityRoute('INCIDENT', 'inc-123', 'CITIZEN')).toBe('/incidents/inc-123');
    expect(getRelatedEntityRoute('INCIDENT', 'inc-123', 'ADMIN')).toBe('/admin/incidents/inc-123');
    expect(getRelatedEntityRoute('EMERGENCY_REQUEST', 'req-123', 'VOLUNTEER')).toBe('/volunteer/tasks/req-123');
    expect(getRelatedEntityRoute('SAFE_LOCATION', 'loc-123', 'ADMIN')).toBe('/admin/safe-locations/loc-123');
  });
});
