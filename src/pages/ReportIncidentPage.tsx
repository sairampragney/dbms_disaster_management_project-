import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createIncident } from '../services/incidentService';
import { IncidentType, IncidentSeverity, INCIDENT_TYPE_LABELS } from '../types/incident';
import { INDIAN_STATES_AND_UTS, isValidPincode } from '../constants/indiaData';
import { AlertCircle, CheckCircle2, PhoneCall, ShieldAlert, MapPin, Send } from 'lucide-react';

export const ReportIncidentPage: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentType: 'HEAVY_RAINFALL' as IncidentType,
    severity: 'MEDIUM' as IncidentSeverity,
    location: '',
    city: userProfile?.city || 'Hyderabad',
    district: userProfile?.district || 'Hyderabad',
    state: userProfile?.state || 'Telangana',
    pincode: userProfile?.pincode || '500072',
    latitude: '17.3850',
    longitude: '78.4867',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to submit an incident report.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required incident details (Title, Description, and Location).');
      return;
    }

    if (!isValidPincode(formData.pincode)) {
      setError('Please enter a valid 6-digit Indian PIN Code (e.g. 500072).');
      return;
    }

    setLoading(true);

    try {
      const newId = await createIncident({
        reporterId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        incidentType: formData.incidentType,
        severity: formData.severity,
        location: formData.location.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
      });

      setSubmittedId(newId);
    } catch (err) {
      console.error('Failed to submit incident:', err);
      setError('Unable to submit incident report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold block">Official Emergency Disclaimer</span>
            <span>Submitting an incident report alerts community coordinators but does NOT directly contact official government emergency services.</span>
          </div>
        </div>
        <a
          href="tel:112"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
        >
          <PhoneCall className="w-4 h-4 animate-pulse" />
          <span>Call 112 Directly</span>
        </a>
      </div>

      {submittedId ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Incident Report Submitted</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your disaster report has been recorded under reference ID <strong>#{submittedId.slice(0, 8)}</strong> and sent for verification.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/incidents/${submittedId}`}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              View Incident Details
            </Link>
            <Link
              to="/my-incidents"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              My Incident Reports
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">Report a Disaster Incident</h1>
            <p className="text-xs text-slate-500 mt-1">
              Report localized flooding, landslides, fire, structural damage, or severe weather in your area.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Headline / Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Severe Urban Flooding near Begumpet Flyover"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Type</label>
                <select
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Severity</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="LOW">LOW - Minor localized impact</option>
                  <option value="MEDIUM">MEDIUM - Moderate damage / risk</option>
                  <option value="HIGH">HIGH - Severe disruption</option>
                  <option value="CRITICAL">CRITICAL - Immediate life threat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Details</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe current status, water levels, road blockages, or people affected..."
                required
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / Landmark</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Street / Area / Landmark (e.g. Near Metro Station, Madhapur)"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {INDIAN_STATES_AND_UTS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Incident...' : 'Submit Incident Report'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
