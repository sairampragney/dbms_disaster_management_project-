import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyAsVolunteer, getVolunteerProfile } from '../services/volunteerService';
import { VolunteerSkill, VOLUNTEER_SKILL_LABELS, VolunteerAvailability } from '../types/volunteer';
import { HeartHandshake, ShieldCheck, AlertCircle, CheckCircle2, Send, ArrowRight } from 'lucide-react';

export const VolunteerApplyPage: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    phone: userProfile?.phone || '+91 ',
    city: userProfile?.city || 'Hyderabad',
    district: userProfile?.district || 'Hyderabad',
    state: userProfile?.state || 'Telangana',
    pincode: userProfile?.pincode || '500072',
    availabilityStatus: 'AVAILABLE' as VolunteerAvailability,
  });

  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkill[]>([
    'FIRST_AID',
    'FOOD_DISTRIBUTION',
  ]);

  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkExisting = async () => {
      setLoading(true);
      try {
        const prof = await getVolunteerProfile(user.uid);
        if (prof) {
          setExistingStatus(prof.verificationStatus);
        }
      } catch (err) {
        console.error('Check existing volunteer application error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkExisting();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillToggle = (skill: VolunteerSkill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in as a citizen to submit a volunteer application.');
      return;
    }

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in all required contact details.');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please select at least one relief skill or capability.');
      return;
    }

    setSubmitting(true);

    try {
      await applyAsVolunteer(user.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        skills: selectedSkills,
        availabilityStatus: formData.availabilityStatus,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Volunteer application error:', err);
      setError(err.message || 'Failed to submit volunteer application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Checking volunteer status...</p>
      </div>
    );
  }

  if (existingStatus) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Volunteer Application Status</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your volunteer registration record is currently <strong>{existingStatus}</strong>.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {existingStatus === 'APPROVED' ? (
              <Link
                to="/volunteer/dashboard"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                Go to Volunteer Dashboard
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
              >
                Return to Citizen Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm space-y-2 border border-slate-800">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Community Response Corps</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Apply as Disaster Volunteer</h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Join localized emergency response teams across India to assist with search & rescue, first aid, shelter operations, and essential supplies distribution.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Application Submitted</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you for stepping forward! Your volunteer registration has been recorded under status <strong>PENDING VERIFICATION</strong>. Administrators will review your application.
          </p>
          <div className="pt-4">
            <Link
              to="/dashboard"
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Contact & Location Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (+91)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
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
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
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
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Relief Skills & Availability
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your Relief Skills (Multiple Allowed)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(VOLUNTEER_SKILL_LABELS).map(([skillKey, label]) => {
                  const key = skillKey as VolunteerSkill;
                  const isSelected = selectedSkills.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleSkillToggle(key)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Availability</label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="AVAILABLE">AVAILABLE - Ready for emergency dispatch</option>
                <option value="BUSY">BUSY - Currently on other duties</option>
                <option value="UNAVAILABLE">UNAVAILABLE - Not ready at this time</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-sm text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Application...' : 'Submit Volunteer Application'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
