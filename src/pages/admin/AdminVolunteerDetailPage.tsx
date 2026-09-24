import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getVolunteerProfile,
  approveVolunteer,
  rejectVolunteer,
  suspendVolunteer,
  getVolunteerTasks,
} from '../../services/volunteerService';
import {
  VolunteerProfile,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
  VOLUNTEER_SKILL_LABELS,
} from '../../types/volunteer';
import { EmergencyRequest } from '../../types/emergencyRequest';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AdminVolunteerDetailPage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState<VolunteerProfile | null>(null);
  const [tasks, setTasks] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getVolunteerProfile(uid);
      if (!data) {
        setError('Volunteer record not found.');
      } else {
        setVolunteer(data);
        const taskList = await getVolunteerTasks(uid);
        setTasks(taskList);
      }
    } catch (err) {
      console.error('Failed to load volunteer details:', err);
      setError('Error loading volunteer application data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  const formatDate = (dateVal: Timestamp | Date | null) => {
    if (!dateVal) return 'N/A';
    const date = dateVal instanceof Timestamp ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  const handleApprove = async () => {
    if (!uid || !user) return;
    setActionLoading(true);
    setError(null);
    try {
      await approveVolunteer(uid, user.uid);
      setActionSuccess('Volunteer approved and role updated.');
      await loadData();
    } catch (err: any) {
      console.error('Approve volunteer error:', err);
      setError(err.message || 'Failed to approve volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!uid) return;
    if (!window.confirm('Reject this volunteer application?')) return;
    setActionLoading(true);
    setError(null);
    try {
      await rejectVolunteer(uid);
      setActionSuccess('Volunteer application rejected.');
      await loadData();
    } catch (err: any) {
      console.error('Reject volunteer error:', err);
      setError(err.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!uid) return;
    if (!window.confirm('Suspend this volunteer?')) return;
    setActionLoading(true);
    setError(null);
    try {
      await suspendVolunteer(uid);
      setActionSuccess('Volunteer suspended.');
      await loadData();
    } catch (err: any) {
      console.error('Suspend volunteer error:', err);
      setError(err.message || 'Failed to suspend volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading volunteer management detail...</p>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">{error || 'Record Not Found'}</h2>
        </div>
        <button
          onClick={() => navigate('/admin/volunteers')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Volunteers Directory</span>
        </button>
      </div>
    );
  }

  const statusStyle = VERIFICATION_STATUS_COLORS[volunteer.verificationStatus];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/volunteers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Volunteer Registry</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">UID #{volunteer.userId.slice(0, 8)}</span>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <span
            className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {VERIFICATION_STATUS_LABELS[volunteer.verificationStatus]}
          </span>

          <span
            className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
              volunteer.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {volunteer.isActive ? 'Active Dispatch Eligible' : 'Inactive'}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">{volunteer.fullName}</h1>
          <p className="text-xs text-slate-500 font-mono">UID: {volunteer.userId}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Contact Information</span>
            </div>
            <p className="text-slate-600 pl-5 leading-relaxed">
              Phone: {volunteer.phone}<br />
              Location: {volunteer.city}, {volunteer.district}, {volunteer.state} - {volunteer.pincode}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Timestamps & Approval</span>
            </div>
            <div className="pl-5 space-y-1 text-slate-600">
              <p>Applied: {formatDate(volunteer.createdAt)}</p>
              <p>Approved By: {volunteer.approvedBy || 'Pending'}</p>
              <p>Approved At: {formatDate(volunteer.approvedAt)}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Registered Capabilities & Skills</h3>
          <div className="flex flex-wrap gap-2">
            {volunteer.skills && volunteer.skills.length > 0 ? (
              volunteer.skills.map((s) => (
                <span key={s} className="bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold px-3 py-1 rounded-lg">
                  {VOLUNTEER_SKILL_LABELS[s] || s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No skills listed</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Verification & Status Actions</h3>
          <div className="flex flex-wrap gap-3">
            {volunteer.verificationStatus !== 'APPROVED' && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Volunteer</span>
              </button>
            )}

            {volunteer.verificationStatus === 'PENDING' && (
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>
            )}

            {volunteer.verificationStatus === 'APPROVED' && (
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Suspend Volunteer</span>
              </button>
            )}
          </div>
        </div>

        {/* Assigned Response Tasks */}
        <div className="border-t border-slate-200 pt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Assigned Emergency Requests ({tasks.length})</span>
          </h3>

          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No emergency requests assigned to this volunteer.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{task.title}</span>
                    <p className="text-[11px] text-slate-500">{task.location}, {task.city} • Status: {task.status}</p>
                  </div>
                  <Link
                    to={`/admin/emergency-requests/${task.id}`}
                    className="font-bold text-sky-600 hover:text-sky-800 shrink-0"
                  >
                    View Dispatch
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
