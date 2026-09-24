import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getEmergencyRequest,
  acknowledgeEmergencyRequest,
  assignVolunteer,
  startEmergencyResponse,
  resolveEmergencyRequest,
  cancelEmergencyRequest,
} from '../../services/emergencyRequestService';
import {
  EmergencyRequest,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  PRIORITY_COLORS,
} from '../../types/emergencyRequest';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  Play,
  XCircle,
  FileText,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AdminEmergencyRequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [volunteerInput, setVolunteerInput] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');

  const loadData = async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEmergencyRequest(requestId);
      if (!data) {
        setError('Emergency request record not found.');
      } else {
        setRequest(data);
        if (data.assignedVolunteerId) {
          setVolunteerInput(data.assignedVolunteerId);
        }
      }
    } catch (err) {
      console.error('Failed to load request detail:', err);
      setError('Error loading emergency request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

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

  const handleAcknowledge = async () => {
    if (!requestId) return;
    setActionLoading(true);
    setError(null);
    try {
      await acknowledgeEmergencyRequest(requestId);
      setActionSuccess('Emergency request acknowledged successfully.');
      await loadData();
    } catch (err: any) {
      console.error('Acknowledge error:', err);
      setError(err.message || 'Failed to acknowledge request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignVolunteer = async () => {
    if (!requestId) return;
    if (!volunteerInput.trim()) {
      setError('Please enter a valid Volunteer UID to assign.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await assignVolunteer(requestId, volunteerInput.trim());
      setActionSuccess('Volunteer assigned successfully.');
      await loadData();
    } catch (err: any) {
      console.error('Assign volunteer error:', err);
      setError(err.message || 'Failed to assign volunteer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartResponse = async () => {
    if (!requestId) return;
    setActionLoading(true);
    setError(null);
    try {
      await startEmergencyResponse(requestId);
      setActionSuccess('Response status updated to IN_PROGRESS.');
      await loadData();
    } catch (err: any) {
      console.error('Start response error:', err);
      setError(err.message || 'Failed to start response.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;
    if (!resolutionInput.trim()) {
      setError('Please enter resolution and fulfillment notes.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await resolveEmergencyRequest(requestId, resolutionInput);
      setActionSuccess('Emergency request fulfilled and marked RESOLVED.');
      await loadData();
    } catch (err: any) {
      console.error('Resolve request error:', err);
      setError(err.message || 'Failed to resolve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!requestId || !request) return;
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    setActionLoading(true);
    setError(null);
    try {
      await cancelEmergencyRequest(requestId, request.status);
      setActionSuccess('Emergency request marked CANCELLED.');
      await loadData();
    } catch (err: any) {
      console.error('Cancel request error:', err);
      setError(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading emergency request management details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">{error || 'Record Not Found'}</h2>
        </div>
        <button
          onClick={() => navigate('/admin/emergency-requests')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Emergency Queue</span>
        </button>
      </div>
    );
  }

  const priorityStyle = PRIORITY_COLORS[request.priority];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/emergency-requests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Emergency Requests Queue</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">Ref #{request.id}</span>
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
              <span>Location & Requester</span>
            </div>
            <p className="text-slate-600 pl-5 leading-relaxed">
              Address: {request.location}<br />
              Region: {request.city}, {request.district}, {request.state} - {request.pincode}<br />
              Requester UID: <span className="font-mono">{request.requesterId}</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Timestamps & Responders</span>
            </div>
            <div className="pl-5 space-y-1 text-slate-600">
              <p>Created: {formatDate(request.createdAt)}</p>
              <p>Updated: {formatDate(request.updatedAt)}</p>
              <p>Assigned Volunteer: <span className="font-mono">{request.assignedVolunteerId || 'None'}</span></p>
            </div>
          </div>
        </div>

        {/* Workflow Action Panel */}
        <div className="border-t border-slate-200 pt-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>Admin Workflow Actions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Acknowledge */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 block">1. Acknowledge Request</span>
              <p className="text-[11px] text-slate-500">Confirm receipt of emergency request for dispatch.</p>
              <button
                onClick={handleAcknowledge}
                disabled={actionLoading || request.status !== 'PENDING'}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40"
              >
                Acknowledge Request
              </button>
            </div>

            {/* Step 2: Assign Volunteer */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 block">2. Assign Volunteer Responder</span>
              <input
                type="text"
                placeholder="Enter Volunteer UID"
                value={volunteerInput}
                onChange={(e) => setVolunteerInput(e.target.value)}
                disabled={actionLoading || request.status === 'RESOLVED' || request.status === 'CANCELLED'}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
              <button
                onClick={handleAssignVolunteer}
                disabled={actionLoading || request.status === 'RESOLVED' || request.status === 'CANCELLED'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Volunteer</span>
              </button>
            </div>

            {/* Step 3: Start Response */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 block">3. Start Dispatch Response</span>
              <p className="text-[11px] text-slate-500">Mark emergency response as active and in progress.</p>
              <button
                onClick={handleStartResponse}
                disabled={actionLoading || request.status === 'RESOLVED' || request.status === 'CANCELLED'}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Mark IN_PROGRESS</span>
              </button>
            </div>

            {/* Step 4: Cancel Request */}
            <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 block">4. Cancel Request</span>
              <p className="text-[11px] text-slate-500">Cancel request if duplicate or no longer required.</p>
              <button
                onClick={handleCancel}
                disabled={actionLoading || request.status === 'RESOLVED' || request.status === 'CANCELLED'}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Request</span>
              </button>
            </div>
          </div>

          {/* Resolve Section */}
          <form onSubmit={handleResolve} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-emerald-50/50">
            <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>5. Fulfill & Resolve Request</span>
            </span>
            <textarea
              rows={3}
              placeholder="Enter fulfillment details, delivered relief items, or medical resolution notes..."
              value={resolutionInput}
              onChange={(e) => setResolutionInput(e.target.value)}
              disabled={actionLoading || request.status === 'RESOLVED' || request.status === 'CANCELLED'}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <button
              type="submit"
              disabled={actionLoading || request.status === 'RESOLVED' || request.status === 'CANCELLED'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors disabled:opacity-40 shadow-xs"
            >
              Fulfill and Mark RESOLVED
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
