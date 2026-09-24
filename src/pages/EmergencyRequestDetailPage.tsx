import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmergencyRequest, cancelEmergencyRequest } from '../services/emergencyRequestService';
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
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const EmergencyRequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEmergencyRequest(requestId);
        if (!data) {
          setError('Emergency request not found.');
        } else if (user && data.requesterId !== user.uid && userProfile?.role !== 'ADMIN') {
          setError('You do not have permission to view this private request.');
        } else {
          setRequest(data);
        }
      } catch (err) {
        console.error('Error loading request detail:', err);
        setError('Failed to load emergency request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
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

  const handleCancel = async () => {
    if (!request || !requestId) return;
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;

    setCancelling(true);
    setError(null);

    try {
      await cancelEmergencyRequest(requestId, request.status);
      setRequest({
        ...request,
        status: 'CANCELLED',
      });
      setActionSuccess('Your emergency request has been cancelled.');
    } catch (err: any) {
      console.error('Failed to cancel request:', err);
      setError(err.message || 'Unable to cancel emergency request.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading emergency request details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">{error || 'Request Not Found'}</h2>
          <p className="text-xs text-red-700">Please verify the link or check your assistance list.</p>
        </div>
        <button
          onClick={() => navigate('/my-emergency-requests')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Requests</span>
        </button>
      </div>
    );
  }

  const priorityStyle = PRIORITY_COLORS[request.priority];
  const canCancel = request.status === 'PENDING' || request.status === 'ACKNOWLEDGED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-emergency-requests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Emergency Requests</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Ref #{request.id}</span>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Request Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Status Header */}
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

          <span
            className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
              request.status === 'ACKNOWLEDGED'
                ? 'bg-sky-100 text-sky-800'
                : request.status === 'ASSIGNED'
                ? 'bg-indigo-100 text-indigo-800'
                : request.status === 'IN_PROGRESS'
                ? 'bg-amber-100 text-amber-900'
                : request.status === 'RESOLVED'
                ? 'bg-emerald-100 text-emerald-800'
                : request.status === 'CANCELLED'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {REQUEST_STATUS_LABELS[request.status]}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{request.title}</h1>
          <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>
        </div>

        {/* Location & Times Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Assistance Location</span>
            </div>
            <p className="text-slate-600 pl-5 leading-relaxed">
              {request.location}<br />
              {request.city}, {request.district}, {request.state} - {request.pincode}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Timestamps & Assignment</span>
            </div>
            <div className="pl-5 space-y-1 text-slate-600">
              <p>Submitted: {formatDate(request.createdAt)}</p>
              <p>Last Update: {formatDate(request.updatedAt)}</p>
              {request.assignedVolunteerId && (
                <p className="text-indigo-700 font-semibold flex items-center gap-1 mt-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Responder Assigned: #{request.assignedVolunteerId.slice(0, 8)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Notes if Resolved */}
        {request.status === 'RESOLVED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Fulfillment & Resolution Summary</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed pl-6">
              {request.resolutionNotes || 'This emergency assistance request has been fulfilled.'}
            </p>
            <p className="text-[10px] text-emerald-700 font-mono pl-6">
              Resolved on: {formatDate(request.resolvedAt)}
            </p>
          </div>
        )}

        {/* Cancellation Button for Citizens */}
        {canCancel && user && user.uid === request.requesterId && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to withdraw this request?</span>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Request'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Emergency CTA Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs space-y-1">
          <span className="font-extrabold text-amber-400 block">Immediate Life Threat?</span>
          <span className="text-slate-300">Call national emergency services immediately for armed, medical, or fire response.</span>
        </div>
        <a
          href="tel:112"
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <PhoneCall className="w-4 h-4 animate-pulse" />
          <span>Call 112 Now</span>
        </a>
      </div>
    </div>
  );
};
