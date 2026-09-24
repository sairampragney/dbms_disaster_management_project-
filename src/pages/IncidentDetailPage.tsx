import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIncidentById, updateCitizenIncident } from '../services/incidentService';
import { Incident, INCIDENT_TYPE_LABELS, INCIDENT_STATUS_LABELS } from '../types/incident';
import { AlertBadge } from '../components/alerts/AlertBadge';
import { MapPin, Calendar, ArrowLeft, PhoneCall, ShieldAlert, CheckCircle2, Edit3, Save, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const IncidentDetailPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { user, isAdmin } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Citizen Editing State (Only pre-verification allowed)
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!incidentId) return;
    const fetchIncident = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getIncidentById(incidentId);
        if (data) {
          setIncident(data);
          setEditForm({
            title: data.title,
            description: data.description,
            location: data.location,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          });
        } else {
          setError('Incident report not found.');
        }
      } catch (err) {
        console.error('Error loading incident details:', err);
        setError('Failed to load incident details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !incidentId) return;

    if (incident.status !== 'REPORTED') {
      setError('Verified or processed incidents can no longer be edited by citizens.');
      setEditing(false);
      return;
    }

    setSavingEdit(true);
    try {
      await updateCitizenIncident(incidentId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
      });

      const updated = await getIncidentById(incidentId);
      if (updated) setIncident(updated);
      setEditing(false);
    } catch (err) {
      console.error('Error updating incident:', err);
      setError('Failed to save edits to incident report.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading incident details...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl space-y-3">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-red-900">Incident Unavailable</h2>
          <p className="text-xs text-red-700">{error || 'This report is unavailable or access is restricted.'}</p>
        </div>
        <Link to="/my-incidents" className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Incidents</span>
        </Link>
      </div>
    );
  }

  const isReporter = user?.uid === incident.reporterId;
  const isPreVerification = incident.status === 'REPORTED';
  const canEdit = isReporter && isPreVerification;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Navigation Link */}
      <Link to="/my-incidents" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Incident Reports</span>
      </Link>

      {/* Main Incident Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertBadge severity={incident.severity} size="lg" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {INCIDENT_TYPE_LABELS[incident.incidentType]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              incident.status === 'VERIFIED' ? 'bg-sky-100 text-sky-900 border-sky-200' :
              incident.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-900 border-amber-200' :
              incident.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
              incident.status === 'DISMISSED' ? 'bg-slate-100 text-slate-700 border-slate-200' :
              'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {INCIDENT_STATUS_LABELS[incident.status]}
            </span>

            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Pre-Verification</span>
              </button>
            )}
          </div>
        </div>

        {/* Emergency Callout for Critical Severity */}
        {incident.severity === 'CRITICAL' && (
          <div className="bg-red-600 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-extrabold text-sm uppercase tracking-wider text-red-100 block">Critical Emergency Incident</span>
              <p className="text-xs text-red-50">Immediate threat to life or safety. Call official government helpline 112 for rapid dispatch.</p>
            </div>
            <a
              href="tel:112"
              className="bg-white text-red-700 hover:bg-red-50 font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm shrink-0 flex items-center gap-2 shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Call 112</span>
            </a>
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSaveEdit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Edit Pre-Verification Details</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                  maxLength={6}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-1.5 text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {savingEdit ? 'Saving...' : 'Save Edits'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{incident.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-800">{incident.location}, {incident.city}, {incident.state} ({incident.pincode})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Reported: {formatDate(incident.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Incident Description</h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {incident.description}
              </p>
            </div>

            {/* Verification Metadata Section */}
            {incident.verifiedBy && (
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-sky-900">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>Verified by Response Team</span>
                </div>
                <p className="text-sky-800">
                  Verified on {formatDate(incident.verifiedAt)}
                </p>
              </div>
            )}

            {/* Resolution Metadata Section */}
            {incident.resolutionNotes && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolution Details</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">{incident.resolutionNotes}</p>
                {incident.resolvedAt && (
                  <span className="text-[10px] text-emerald-600 block pt-1">
                    Resolved on {formatDate(incident.resolvedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <span>Incident Reference ID: {incident.id}</span>
          {isAdmin && (
            <Link to={`/admin/incidents/${incident.id}`} className="font-bold text-sky-600 hover:underline">
              Manage in Admin Portal →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
