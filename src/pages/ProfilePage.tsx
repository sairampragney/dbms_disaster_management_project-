import React, { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userProfile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        city: userProfile.city || '',
        district: userProfile.district || userProfile.city || '',
        state: userProfile.state || 'Telangana',
        pincode: userProfile.pincode || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!userProfile?.uid) {
      setError('User session not found.');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setError('Please enter a valid 6-digit PIN Code (e.g., 500072).');
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        district: formData.district.trim() || formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        updatedAt: Timestamp.now(),
      });

      await refreshProfile();
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
            <p className="text-xs text-slate-500">Manage your account and location details.</p>
          </div>
          <div className="bg-sky-50 border border-sky-200 text-sky-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Role: {userProfile?.role || 'CITIZEN'}</span>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only fields: Email & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email Address (Read-only)
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{userProfile?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Role Permission (Protected)
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>{userProfile?.role || 'CITIZEN'}</span>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (+91)</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
              >
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Kerala">Kerala</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="500072"
                maxLength={6}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg shadow-sm text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
