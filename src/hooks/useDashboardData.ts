import { useState, useEffect } from 'react';
import { getPublicAlerts } from '../services/alertService';
import { getMyIncidents, getAdminIncidents } from '../services/incidentService';
import { getMyEmergencyRequests, getAdminEmergencyRequests } from '../services/emergencyRequestService';
import { getPublicSafeLocations, getAdminSafeLocations } from '../services/safeLocationService';
import { getAdminVolunteers } from '../services/volunteerService';
import { getUnreadNotificationCount, getMyNotifications } from '../services/notificationService';
import { Alert } from '../types/alert';
import { Incident } from '../types/incident';
import { EmergencyRequest } from '../types/emergencyRequest';
import { SafeLocation } from '../types/safeLocation';
import { VolunteerProfile } from '../types/volunteer';
import { AppNotification } from '../types/notification';

export interface CitizenDashboardData {
  alerts: Alert[];
  incidents: Incident[];
  emergencyRequests: EmergencyRequest[];
  safeLocations: SafeLocation[];
  unreadNotificationCount: number;
  recentNotifications: AppNotification[];
}

export interface VolunteerDashboardMetrics {
  profile: VolunteerProfile | null;
  tasks: EmergencyRequest[];
  unreadNotificationCount: number;
  recentNotifications: AppNotification[];
}

export interface AdminDashboardData {
  alerts: Alert[];
  incidents: Incident[];
  requests: EmergencyRequest[];
  volunteers: VolunteerProfile[];
  safeLocations: SafeLocation[];
  unreadNotificationCount: number;
}

export const useCitizenDashboardData = (uid: string) => {
  const [data, setData] = useState<CitizenDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [alerts, incidents, requests, safeLocs, unreadCount, notifs] = await Promise.all([
          getPublicAlerts(),
          getMyIncidents(uid),
          getMyEmergencyRequests(uid),
          getPublicSafeLocations(),
          getUnreadNotificationCount(uid),
          getMyNotifications(uid),
        ]);

        setData({
          alerts,
          incidents,
          emergencyRequests: requests,
          safeLocations: safeLocs,
          unreadNotificationCount: unreadCount,
          recentNotifications: notifs.slice(0, 5),
        });
      } catch (err) {
        console.error('Citizen dashboard data load error:', err);
        setError('Failed to load citizen dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [uid]);

  return { data, loading, error };
};

export const useAdminDashboardData = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [alerts, incidents, requests, volunteers, safeLocs] = await Promise.all([
          getPublicAlerts(),
          getAdminIncidents(),
          getAdminEmergencyRequests(),
          getAdminVolunteers(),
          getAdminSafeLocations(),
        ]);

        setData({
          alerts,
          incidents,
          requests,
          volunteers,
          safeLocations: safeLocs,
          unreadNotificationCount: 0,
        });
      } catch (err) {
        console.error('Admin dashboard data load error:', err);
        setError('Failed to load admin operational metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  return { data, loading, error };
};
