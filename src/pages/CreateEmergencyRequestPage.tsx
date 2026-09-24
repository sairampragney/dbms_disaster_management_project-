import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEmergencyRequest } from '../services/emergencyRequestService';
import { RequestType, RequestPriority, REQUEST_TYPE_LABELS } from '../types/emergencyRequest';
import { INDIAN_STATES_AND_UTS, isValidPincode } from '../constants/indiaData';
import { PhoneCall, ShieldAlert, AlertCircle, CheckCircle2, MapPin, Send, HeartHandshake } from 'lucide-react';

export const CreateEmergencyRequestPage: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestType: 'FOOD_WATER' as RequestType,
    priority: 'HIGH' as RequestPriority,
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to request emergency assistance.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please complete all required fields (Title, Description, and Location).');
      return;
    }

    if (!isValidPincode(formData.pincode)) {
      setError('Please enter a valid 6-digit Indian PIN Code (e.g. 500072).');
      return;
    }

    setLoading(true);

    try {
      const newId = await createEmergencyRequest({
        requesterId: user.uid,
        title: formData.title.trim(),
        description: formData.description.trim(),
        requestType: formData.requestType,
        priority: formData.priority,
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
      console.error('Failed to submit emergency request:', err);
      setError('Unable to submit emergency request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Emergency Notice Banner */}
      <div className="bg-red-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold block text-sm">Life-Threatening Emergency Notice</span>
            <span>This platform coordinates community assistance. For immediate government emergency response in India, call 112 directly.</span>
          </div>
        </div>
        <a
          href="tel:112"
          className="bg-white text-red-700 hover:bg-red-50 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
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
          <h2 className="text-2xl font-bold text-slate-900">Emergency Request Created</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your request for assistance has been logged under reference ID <strong>#{submittedId.slice(0, 8)}</strong>. Community response teams and administrators have been alerted.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/emergency-requests/${submittedId}`}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              View Request Details
            </Link>
            <Link
              to="/my-emergency-requests"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              My Emergency Requests
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Request Emergency Assistance</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Request medical aid, food/water, rescue, or evacuation from community responders.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Request Headline / Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Emergency Food & Drinking Water Needed for Family of 4"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assistance Category</label>
                <select
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {Object.entries(REQUEST_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency / Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="LOW">LOW - Non-critical relief assistance</option>
                  <option value="MEDIUM">MEDIUM - Need assistance within 12 hours</option>
                  <option value="HIGH">HIGH - Need assistance within 2 hours</option>
                  <option value="CRITICAL">CRITICAL - Immediate life risk / evacuation</option>
                </select>
              </div>
            </div>

            {formData.priority === 'CRITICAL' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-xs text-red-800">
                <span className="font-semibold">Selected Critical Priority: If lives are in danger, call 112 immediately.</span>
                <a href="tel:112" className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg text-xs shrink-0">
                  Call 112
                </a>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Requirements</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Specify number of people affected, medical conditions, dietary constraints, or exact situation..."
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
                  placeholder="Street / Area / House No. (e.g. House #12, Road No. 3, Banjara Hills)"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Request...' : 'Submit Emergency Request'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
