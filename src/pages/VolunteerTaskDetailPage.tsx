import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmergencyRequest } from '../services/emergencyRequestService';
import { acceptAssignment, rejectAssignment, startVolunteerResponse } from '../services/volunteerService';
import {
  EmergencyRequest,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  PRIORITY_COLORS,
} from '../types/emergencyRequest';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ArrowLeft,
  XCircle,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const VolunteerTaskDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEmergencyRequest(requestId);
      if (!data) {
        setError('Assigned task request record not found.');
      } else if (user && data.assignedVolunteerId !== user.uid) {
        setError('You do not have permission to view or manage this assigned task.');
      } else {
        setRequest(data);
      }
    } catch (err) {
      console.error('Error loading task detail:', err);
      setError('Failed to load assigned response task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId, user]);

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

  const handleAccept = async () => {
    if (!requestId || !user) return;
    setActionLoading(true);
    setError(null);
    try {
      await acceptAssignment(requestId, user.uid);
      setActionSuccess('Task assignment accepted. Your status is now BUSY.');
      await loadData();
    } catch (err: any) {
      console.error('Accept task error:', err);
      setError(err.message || 'Failed to accept task assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!requestId || !user) return;
    if (!window.confirm('Are you sure you want to decline/reject this dispatch assignment?')) return;
    setActionLoading(true);
    setError(null);
    try {
      await rejectAssignment(requestId, user.uid);
      setActionSuccess('Task assignment declined.');
      setTimeout(() => {
        navigate('/volunteer/tasks');
      }, 1000);
    } catch (err: any) {
      console.error('Reject task error:', err);
      setError(err.message || 'Failed to decline assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!requestId) return;
    setActionLoading(true);
    setError(null);
    try {
      await startVolunteerResponse(requestId);
      setActionSuccess('Response status updated to IN_PROGRESS.');
      await loadData();
    } catch (err: any) {
      console.error('Start response error:', err);
      setError(err.message || 'Failed to update response state.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading assigned task details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">{error || 'Task Record Not Found'}</h2>
        </div>
        <button
          onClick={() => navigate('/volunteer/tasks')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Tasks</span>
        </button>
      </div>
    );
  }

  const priorityStyle = PRIORITY_COLORS[request.priority];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/volunteer/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Assigned Tasks</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Ref #{request.id}</span>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {request.priority} Priority
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {REQUEST_TYPE_LABELS[request.requestType]}
            </span>
          </div>

          <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
            {REQUEST_STATUS_LABELS[request.status]}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">{request.title}</h1>
          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Location Coordinates</span>
            </div>
            <p className="text-slate-600 pl-5 leading-relaxed">
              Address: {request.location}<br />
              City/Region: {request.city}, {request.district}, {request.state} - {request.pincode}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Timestamps</span>
            </div>
            <div className="pl-5 space-y-1 text-slate-600">
              <p>Submitted: {formatDate(request.createdAt)}</p>
              <p>Updated: {formatDate(request.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Volunteer Response Actions</span>
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAccept}
              disabled={actionLoading || request.status === 'IN_PROGRESS' || request.status === 'RESOLVED'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Assignment</span>
            </button>

            <button
              onClick={handleStart}
              disabled={actionLoading || request.status === 'IN_PROGRESS' || request.status === 'RESOLVED'}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Play className="w-4 h-4" />
              <span>Start Active Response (IN_PROGRESS)</span>
            </button>

            <button
              onClick={handleReject}
              disabled={actionLoading || request.status === 'RESOLVED'}
              className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <XCircle className="w-4 h-4" />
              <span>Decline Assignment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs space-y-1">
          <span className="font-extrabold text-amber-400 block">Critical Emergency Assistance</span>
          <span className="text-slate-300">If lives are in danger during dispatch, call 112 directly.</span>
        </div>
        <a
          href="tel:112"
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <PhoneCall className="w-4 h-4 animate-pulse" />
          <span>Call 112</span>
        </a>
      </div>
    </div>
  );
};
