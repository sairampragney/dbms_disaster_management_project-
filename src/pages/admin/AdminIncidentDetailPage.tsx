import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getIncidentById,
  verifyIncident,
  startIncidentResponse,
  resolveIncident,
  dismissIncident,
} from '../../services/incidentService';
import { Incident, INCIDENT_TYPE_LABELS, INCIDENT_STATUS_LABELS } from '../../types/incident';
import { AlertBadge } from '../../components/alerts/AlertBadge';
import { ArrowLeft, CheckCircle2, ShieldCheck, PhoneCall, MapPin, Calendar, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AdminIncidentDetailPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { user } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadDetail = async () => {
    if (!incidentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getIncidentById(incidentId);
      if (data) {
        setIncident(data);
        if (data.resolutionNotes) setResolutionNotes(data.resolutionNotes);
      } else {
        setError('Incident record not found.');
      }
    } catch (err) {
      console.error('Error fetching incident:', err);
      setError('Failed to fetch incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [incidentId]);

  const formatDate = (dateVal?: Timestamp | Date | null) => {
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

  const handleVerify = async () => {
    if (!incidentId || !user) return;
    setActionLoading(true);
    try {
      await verifyIncident(incidentId, user.uid);
      await loadDetail();
    } catch (err) {
      console.error('Error verifying incident:', err);
      setError('Failed to verify incident.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartResponse = async () => {
    if (!incidentId) return;
    setActionLoading(true);
    try {
      await startIncidentResponse(incidentId);
      await loadDetail();
    } catch (err) {
      console.error('Error starting response:', err);
      setError('Failed to transition status to IN_PROGRESS.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId || !resolutionNotes.trim()) return;
    setActionLoading(true);
    try {
      await resolveIncident(incidentId, resolutionNotes.trim());
      await loadDetail();
    } catch (err) {
      console.error('Error resolving incident:', err);
      setError('Failed to resolve incident.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!incidentId) return;
    const notes = resolutionNotes.trim() || 'Dismissed by admin after review.';
    setActionLoading(true);
    try {
      await dismissIncident(incidentId, notes);
      await loadDetail();
    } catch (err) {
      console.error('Error dismissing incident:', err);
      setError('Failed to dismiss incident.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading incident details...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-2">
          <p className="font-bold text-base">{error || 'Incident unavailable'}</p>
        </div>
        <Link to="/admin/incidents" className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Incident Queue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/admin/incidents" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Incident Queue</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertBadge severity={incident.severity} size="lg" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {INCIDENT_TYPE_LABELS[incident.incidentType]}
            </span>
          </div>

          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            incident.status === 'VERIFIED' ? 'bg-sky-100 text-sky-900 border-sky-200' :
            incident.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-900 border-amber-200' :
            incident.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
            incident.status === 'DISMISSED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
            'bg-slate-100 text-slate-800 border-slate-200'
          }`}>
            {INCIDENT_STATUS_LABELS[incident.status]}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{incident.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{incident.location}, {incident.city}, {incident.state} ({incident.pincode})</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Reported: {formatDate(incident.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Reporter UID: {incident.reporterId}</span>
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        {incident.severity === 'CRITICAL' && (
          <div className="bg-red-600 text-white rounded-xl p-4 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Priority Emergency Incident</span>
            <a href="tel:112" className="bg-white text-red-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 shrink-0">
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" /> Call 112
            </a>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Details</h3>
          <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Admin Workflow Action Controls */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm">Admin Operational Workflow Controls</h2>
          </div>

          {incident.status === 'REPORTED' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">This report is pending verification. Verify to acknowledge or dismiss if invalid.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVerify}
                  disabled={actionLoading}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Verify Incident
                </button>
                <button
                  onClick={handleDismiss}
                  disabled={actionLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {incident.status === 'VERIFIED' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">Verified by admin UID {incident.verifiedBy} on {formatDate(incident.verifiedAt)}. Dispatch response or resolve.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartResponse}
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Mark Response In Progress
                </button>
              </div>
            </div>
          )}

          {(incident.status === 'VERIFIED' || incident.status === 'IN_PROGRESS') && (
            <form onSubmit={handleResolve} className="space-y-3 border-t border-slate-800 pt-3">
              <label className="block text-xs font-semibold text-slate-200">Resolution Notes & Completion Summary</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Enter actions taken, ground response details, or resolution summary..."
                required
                className="w-full px-3 py-2 text-xs border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  Resolve Incident
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={actionLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </form>
          )}

          {(incident.status === 'RESOLVED' || incident.status === 'DISMISSED') && (
            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Operational Lifecycle Completed ({INCIDENT_STATUS_LABELS[incident.status]})</span>
              </div>
              {incident.resolutionNotes && <p className="text-slate-400 pt-1">Notes: {incident.resolutionNotes}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
