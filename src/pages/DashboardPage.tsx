import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCitizenDashboardData } from '../hooks/useDashboardData';
import { AlertBadge } from '../components/alerts/AlertBadge';
import {
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  FileText,
  HeartHandshake,
  MapPin,
  Bell,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { data, loading, error } = useCitizenDashboardData(user?.uid || '');

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading citizen disaster response dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-red-800 bg-red-50 border border-red-200 rounded-2xl">
        <p className="font-bold">{error || 'Unable to load dashboard metrics.'}</p>
      </div>
    );
  }

  const activePublicAlerts = data.alerts.filter((a) => a.status === 'ACTIVE' && a.isPublic);
  const pendingRequests = data.emergencyRequests.filter((r) => r.status === 'PENDING' || r.status === 'ACKNOWLEDGED');
  const activeIncidents = data.incidents.filter((i) => i.status === 'REPORTED' || i.status === 'VERIFIED' || i.status === 'IN_PROGRESS');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Citizen Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {userProfile?.fullName || 'Citizen'}</h1>
          <p className="text-xs text-slate-300">
            {userProfile?.city || 'Hyderabad'}, {userProfile?.state || 'Telangana'} • PIN {userProfile?.pincode || '500072'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/emergency-requests/new"
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Request Emergency Aid</span>
          </Link>
          <Link
            to="/incidents/report"
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </Link>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Alerts Card */}
        <Link
          to="/alerts"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition-colors flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Alerts</span>
            <div className="text-2xl font-extrabold text-slate-900">{activePublicAlerts.length}</div>
            <p className="text-[11px] text-amber-700 font-semibold">Public Advisories</p>
          </div>
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Link>

        {/* Requests Card */}
        <Link
          to="/my-emergency-requests"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-red-400 transition-colors flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Emergency Requests</span>
            <div className="text-2xl font-extrabold text-slate-900">{data.emergencyRequests.length}</div>
            <p className="text-[11px] text-red-700 font-semibold">{pendingRequests.length} Pending Dispatch</p>
          </div>
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </Link>

        {/* Incidents Card */}
        <Link
          to="/my-incidents"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-sky-400 transition-colors flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Incident Reports</span>
            <div className="text-2xl font-extrabold text-slate-900">{data.incidents.length}</div>
            <p className="text-[11px] text-sky-700 font-semibold">{activeIncidents.length} Under Verification</p>
          </div>
          <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </Link>

        {/* Safe Locations Card */}
        <Link
          to="/safe-locations"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-colors flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safe Locations</span>
            <div className="text-2xl font-extrabold text-slate-900">{data.safeLocations.length}</div>
            <p className="text-[11px] text-emerald-700 font-semibold">Shelters & Centers</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Main Grid Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Alerts & Recent Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public Alerts Stream */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Active Public Disaster Advisories</span>
              </h2>
              <Link to="/alerts" className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activePublicAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No active disaster advisories for your region.</p>
            ) : (
              <div className="space-y-3">
                {activePublicAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="p-4 border border-slate-200 rounded-xl space-y-2 hover:border-amber-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <AlertBadge severity={alert.severity} size="sm" />
                      <span className="text-[10px] font-semibold text-slate-400">{alert.city}, {alert.state}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      <Link to={`/alerts/${alert.id}`} className="hover:text-amber-600 transition-colors">
                        {alert.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{alert.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Requests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-red-600" />
                <span>My Emergency Assistance Requests</span>
              </h2>
              <Link to="/my-emergency-requests" className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1">
                <span>View Requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.emergencyRequests.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-slate-500">You have no active emergency requests.</p>
                <Link to="/emergency-requests/new" className="inline-block bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
                  Request Emergency Aid
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.emergencyRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{req.title}</span>
                      <p className="text-[11px] text-slate-500">{req.location} • Priority: {req.priority}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Notifications & Helplines */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-600" />
                <span>Notifications ({data.unreadNotificationCount})</span>
              </h2>
              <Link to="/notifications" className="text-xs font-bold text-sky-600 hover:text-sky-800">
                All ({data.unreadNotificationCount})
              </Link>
            </div>

            {data.recentNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No unread notifications.</p>
            ) : (
              <div className="space-y-2">
                {data.recentNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">{notif.title}</span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Helplines */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <span>National Emergency Helplines (India)</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Nationwide Single Emergency Number</span>
                <strong className="text-red-400">112</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Police Helpline</span>
                <strong className="text-white">100</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Fire Service</span>
                <strong className="text-white">101</strong>
              </li>
              <li className="flex justify-between">
                <span>Ambulance Service</span>
                <strong className="text-white">108</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
