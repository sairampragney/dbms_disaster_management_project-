import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVolunteerProfile, updateVolunteerProfile } from '../services/volunteerService';
import { VolunteerProfile, VolunteerSkill, VOLUNTEER_SKILL_LABELS } from '../types/volunteer';
import { CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VolunteerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
  });

  const [selectedSkills, setSelectedSkills] = useState<VolunteerSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getVolunteerProfile(user.uid);
        if (data) {
          setProfile(data);
          setFormData({
            phone: data.phone || '',
            city: data.city || '',
            district: data.district || '',
            state: data.state || '',
            pincode: data.pincode || '',
          });
          setSelectedSkills(data.skills || []);
        }
      } catch (err) {
        console.error('Failed to load volunteer profile:', err);
        setError('Unable to load volunteer profile details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!user || !profile) return;
    setError(null);
    setActionSuccess(null);

    if (!formData.phone.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in required fields (Phone, City, State).');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please select at least one relief capability skill.');
      return;
    }

    setSubmitting(true);

    try {
      await updateVolunteerProfile(user.uid, {
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        skills: selectedSkills,
      });

      setActionSuccess('Volunteer profile updated successfully.');
    } catch (err: any) {
      console.error('Update volunteer profile error:', err);
      setError(err.message || 'Failed to update volunteer profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading volunteer profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-600">No volunteer profile found for this account.</p>
        <Link to="/volunteer/apply" className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl inline-block">
          Apply as Volunteer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/volunteer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Volunteer Command Portal</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">UID #{profile.userId.slice(0, 8)}</span>
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

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Volunteer Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update contact information, emergency response location, and skills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Read Only)</label>
            <input
              type="text"
              value={profile.fullName}
              disabled
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (+91)</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Relief Skills & Capabilities</label>
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
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
