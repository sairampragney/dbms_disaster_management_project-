import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminDashboardData } from '../../hooks/useDashboardData';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  HeartHandshake,
  UserCheck,
  Building2,
  Bell,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Alert } from '../../types/alert';
import { Incident } from '../../types/incident';
import { EmergencyRequest } from '../../types/emergencyRequest';
import { VolunteerProfile } from '../../types/volunteer';
import { SafeLocation } from '../../types/safeLocation';

export const AdminDashboardPage: React.FC = () => {
  const { data, loading, error } = useAdminDashboardData();

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading admin operational metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-red-800 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold">{error || 'Failed to load admin metrics.'}</p>
      </div>
    );
  }

  // Calculate Metrics with TypeScript Types
  const activeAlerts = data.alerts.filter((a: Alert) => a.status === 'ACTIVE').length;
  const criticalAlerts = data.alerts.filter((a: Alert) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  const pendingIncidents = data.incidents.filter((i: Incident) => i.status === 'REPORTED').length;

  const pendingRequests = data.requests.filter((r: EmergencyRequest) => r.status === 'PENDING').length;
  const criticalRequests = data.requests.filter((r: EmergencyRequest) => r.priority === 'CRITICAL' && r.status !== 'RESOLVED' && r.status !== 'CANCELLED').length;

  const pendingVolunteers = data.volunteers.filter((v: VolunteerProfile) => v.verificationStatus === 'PENDING').length;
  const approvedVolunteers = data.volunteers.filter((v: VolunteerProfile) => v.verificationStatus === 'APPROVED' && v.isActive).length;

  const availableShelters = data.safeLocations.filter((s: SafeLocation) => s.isActive && s.availabilityStatus === 'AVAILABLE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Operational Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Executive Disaster Overview</h1>
          <p className="text-xs text-slate-300">
            Real-time operational summary across Indian disaster advisories, reported incidents, emergency dispatches, volunteer verification, and shelter capacity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/admin/notifications"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Dispatch Notification</span>
          </Link>
          <Link
            to="/admin/alerts"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Alert</span>
          </Link>
        </div>
      </div>

      {/* Primary Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Disaster Alerts Card */}
        <Link
          to="/admin/alerts"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disaster Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{activeAlerts}</div>
          <p className="text-[11px] text-red-600 font-bold">{criticalAlerts} Critical Advisories</p>
        </Link>

        {/* Incident Queue Card */}
        <Link
          to="/admin/incidents"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-sky-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Incidents Queue</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{data.incidents.length}</div>
          <p className="text-[11px] text-amber-600 font-bold">{pendingIncidents} Pending Verification</p>
        </Link>

        {/* Emergency Requests Card */}
        <Link
          to="/admin/emergency-requests"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-red-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Emergency Requests</span>
            <HeartHandshake className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{pendingRequests}</div>
          <p className="text-[11px] text-red-600 font-bold">{criticalRequests} Critical Urgency</p>
        </Link>

        {/* Volunteers Registry Card */}
        <Link
          to="/admin/volunteers"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Volunteer Registry</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{approvedVolunteers}</div>
          <p className="text-[11px] text-amber-600 font-bold">{pendingVolunteers} Pending Approval</p>
        </Link>

        {/* Safe Locations Card */}
        <Link
          to="/admin/safe-locations"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Safe Locations</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{data.safeLocations.length}</div>
          <p className="text-[11px] text-emerald-600 font-bold">{availableShelters} Open Shelters</p>
        </Link>
      </div>

      {/* Detailed Module Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Requests Dispatch Stream */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-red-600" />
              <span>Pending Emergency Request Queue</span>
            </h2>
            <Link to="/admin/emergency-requests" className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
              <span>Manage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.requests.filter((r: EmergencyRequest) => r.status === 'PENDING').length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No pending emergency assistance requests.</p>
          ) : (
            <div className="space-y-3">
              {data.requests
                .filter((r: EmergencyRequest) => r.status === 'PENDING')
                .slice(0, 4)
                .map((req: EmergencyRequest) => (
                  <div key={req.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{req.title}</span>
                      <p className="text-[11px] text-slate-500">{req.location}, {req.city} • Priority: {req.priority}</p>
                    </div>
                    <Link
                      to={`/admin/emergency-requests/${req.id}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shrink-0"
                    >
                      Dispatch
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Volunteer Applications Stream */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Pending Volunteer Verification Applications</span>
            </h2>
            <Link to="/admin/volunteers" className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
              <span>View Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.volunteers.filter((v: VolunteerProfile) => v.verificationStatus === 'PENDING').length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No pending volunteer applications needing review.</p>
          ) : (
            <div className="space-y-3">
              {data.volunteers
                .filter((v: VolunteerProfile) => v.verificationStatus === 'PENDING')
                .slice(0, 4)
                .map((vol: VolunteerProfile) => (
                  <div key={vol.userId} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{vol.fullName}</span>
                      <p className="text-[11px] text-slate-500">{vol.city}, {vol.state} • {vol.phone}</p>
                    </div>
                    <Link
                      to={`/admin/volunteers/${vol.userId}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
