import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getVolunteerProfile,
  updateVolunteerAvailability,
  getVolunteerTasks,
} from '../services/volunteerService';
import {
  VolunteerProfile,
  VolunteerAvailability,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
  VOLUNTEER_SKILL_LABELS,
} from '../types/volunteer';
import { EmergencyRequest } from '../types/emergencyRequest';
import {
  ShieldCheck,
  UserCheck,
  ClipboardList,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export const VolunteerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [tasks, setTasks] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const prof = await getVolunteerProfile(user.uid);
      setProfile(prof);

      if (prof) {
        const taskList = await getVolunteerTasks(user.uid);
        setTasks(taskList);
      }
    } catch (err) {
      console.error('Error loading volunteer dashboard:', err);
      setError('Failed to load volunteer profile and task assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAvailabilityChange = async (newStatus: VolunteerAvailability) => {
    if (!user || !profile) return;
    setUpdatingAvailability(true);
    setError(null);
    try {
      await updateVolunteerAvailability(user.uid, newStatus);
      setProfile({
        ...profile,
        availabilityStatus: newStatus,
      });
    } catch (err: any) {
      console.error('Failed to update availability:', err);
      setError(err.message || 'Unable to update availability status.');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading volunteer dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-amber-900">Volunteer Application Required</h2>
          <p className="text-xs text-amber-800">
            You do not currently have a registered volunteer profile. Please submit a volunteer application first.
          </p>
        </div>
        <Link
          to="/volunteer/apply"
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <span>Apply as Volunteer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const statusStyle = VERIFICATION_STATUS_COLORS[profile.verificationStatus];
  const activeTasks = tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Volunteer Command Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome, {profile.fullName}</h1>
          <p className="text-xs text-slate-300">
            Disaster Response Volunteer • {profile.city}, {profile.state}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Tasks</span>
          </button>
          <Link
            to="/volunteer/tasks"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>View All Assigned Tasks ({tasks.length})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Verification Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Status</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            className={`inline-block text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {VERIFICATION_STATUS_LABELS[profile.verificationStatus]}
          </div>
          <p className="text-[11px] text-slate-500">
            Approved volunteers can receive emergency assistance task dispatches.
          </p>
        </div>

        {/* Availability Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Availability</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>

          <div className="space-y-1.5">
            <select
              value={profile.availabilityStatus}
              onChange={(e) => handleAvailabilityChange(e.target.value as VolunteerAvailability)}
              disabled={updatingAvailability || profile.verificationStatus !== 'APPROVED'}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="AVAILABLE">AVAILABLE - Ready for dispatch</option>
              <option value="BUSY">BUSY - On active assignment</option>
              <option value="UNAVAILABLE">UNAVAILABLE - Standby / Off duty</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Update availability to control dispatch availability.
            </p>
          </div>
        </div>

        {/* Assigned Tasks Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Response Assignments</span>
            <ClipboardList className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeTasks.length}</span>
            <span className="text-xs font-bold text-slate-500">Active Task Dispatches</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Total assignments logged: <strong>{tasks.length}</strong>
          </p>
        </div>
      </div>

      {/* Registered Skills & Profile Quick Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Registered Relief Capabilities</span>
          </h3>
          <Link to="/volunteer/profile" className="text-xs font-bold text-sky-600 hover:text-sky-800">
            Edit Profile
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.skills && profile.skills.length > 0 ? (
            profile.skills.map((svc) => (
              <span
                key={svc}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{VOLUNTEER_SKILL_LABELS[svc] || svc}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No specific skills listed</span>
          )}
        </div>
      </div>

      {/* Active Tasks Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <span>Active Response Tasks</span>
          </h2>
          <Link to="/volunteer/tasks" className="text-xs font-bold text-sky-600 hover:text-sky-800">
            View All ({tasks.length})
          </Link>
        </div>

        {activeTasks.length === 0 ? (
          <div className="py-8 text-center space-y-2 text-slate-500">
            <p className="text-xs font-medium">No active emergency response tasks assigned at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTasks.map((task) => (
              <div key={task.id} className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                    {task.priority} URGENCY
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {task.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.city}</span>
                  </span>
                  <Link
                    to={`/volunteer/tasks/${task.id}`}
                    className="font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Manage Task</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
