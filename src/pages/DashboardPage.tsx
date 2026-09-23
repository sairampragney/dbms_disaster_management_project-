import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, MapPin, HeartHandshake, User, Bell, PhoneCall } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-sky-800/80 border border-sky-600/50 px-3 py-1 rounded-full text-xs font-semibold text-sky-200">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            <span>Role: {userProfile?.role || 'CITIZEN'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Welcome back, {userProfile?.fullName || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-sky-200">
            Location: {userProfile?.city}, {userProfile?.state} ({userProfile?.pincode})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:112"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors shrink-0"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Emergency 112</span>
          </a>
          <Link
            to="/profile"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shrink-0 flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/emergency"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Emergency
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Request Assistance</h3>
            <p className="text-xs text-slate-600 mt-1">Submit urgent aid requests for food, water, or medical care.</p>
          </div>
        </Link>

        <Link
          to="/alerts"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-sky-100 text-sky-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              Active Alerts
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Disaster Warnings</h3>
            <p className="text-xs text-slate-600 mt-1">View official warnings for {userProfile?.state || 'India'}.</p>
          </div>
        </Link>

        <Link
          to="/safe-locations"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Shelters
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Safe Locations</h3>
            <p className="text-xs text-slate-600 mt-1">Find nearby open relief camps and capacity status.</p>
          </div>
        </Link>

        <Link
          to="/notifications"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Updates
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">In-App Notifications</h3>
            <p className="text-xs text-slate-600 mt-1">Track updates regarding your reported incidents and requests.</p>
          </div>
        </Link>
      </div>

      {/* Citizen Personal Status Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Personal Activity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>My Incident Reports</span>
              <Link to="/my-incidents" className="text-sky-600 hover:underline">View All</Link>
            </div>
            <p className="text-slate-500">No incident reports submitted yet.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>My Emergency Requests</span>
              <Link to="/my-requests" className="text-sky-600 hover:underline">View All</Link>
            </div>
            <p className="text-slate-500">No emergency requests active.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
