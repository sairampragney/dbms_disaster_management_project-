import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, AlertTriangle, MapPin, HeartHandshake, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { getPublicAlerts } from '../services/alertService';
import { Alert } from '../types/alert';
import { AlertBadge } from '../components/alerts/AlertBadge';

export const HomePage: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopAlerts = async () => {
      try {
        const data = await getPublicAlerts({ status: 'ACTIVE' }, 4);
        setActiveAlerts(data);
      } catch (err) {
        console.error('Failed to load active alerts for homepage:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTopAlerts();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-sky-900">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-sky-900/60 border border-sky-700/60 text-sky-200 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Disaster Awareness & Community Response for India</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Real-time Disaster Alerts & Rapid Community Emergency Relief
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stay informed with verified alerts, discover open safe locations near you, report localized disaster incidents, and coordinate life-saving relief requests.
          </p>

          {/* Quick Action Grid */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <a
              href="tel:112"
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <PhoneCall className="w-6 h-6 animate-pulse" />
              <span className="font-bold text-sm sm:text-base">Call 112</span>
              <span className="text-[10px] text-red-100">National Helpline</span>
            </a>

            <Link
              to="/emergency"
              className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <HeartHandshake className="w-6 h-6" />
              <span className="font-bold text-sm sm:text-base">Request Help</span>
              <span className="text-[10px] text-amber-100">Food, Water, Medical</span>
            </Link>

            <Link
              to="/alerts"
              className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <AlertTriangle className="w-6 h-6" />
              <span className="font-bold text-sm sm:text-base">View Alerts</span>
              <span className="text-[10px] text-sky-100">Active Warnings</span>
            </Link>

            <Link
              to="/safe-locations"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <MapPin className="w-6 h-6" />
              <span className="font-bold text-sm sm:text-base">Safe Locations</span>
              <span className="text-[10px] text-emerald-100">Shelters & Camps</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Disaster Alerts Summary Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Disaster Advisories</h2>
            <p className="text-xs text-slate-500">Live emergency advisories issued for Indian states and cities</p>
          </div>
          <Link to="/alerts" className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
            <span>Fetching active advisories...</span>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            No active critical advisories reported currently. Stay safe and monitor local emergency guidelines.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <AlertBadge severity={alert.severity} size="sm" />
                  <span className="text-[10px] text-slate-400">{alert.affectedArea}, {alert.city}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  <Link to={`/alerts/${alert.id}`} className="hover:text-sky-600">
                    {alert.title}
                  </Link>
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">{alert.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status: {alert.status}</span>
                  <Link to={`/alerts/${alert.id}`} className="font-bold text-sky-600 hover:underline">
                    Read Action & Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Primary Disaster Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Supported Disaster Response Categories</h2>
          <p className="text-sm text-slate-600 mt-1">Tailored for disaster types occurring across Indian states and union territories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { title: 'Flood & Rain', icon: '🌊', bg: 'bg-blue-50 border-blue-200 text-blue-900' },
            { title: 'Urban Flooding', icon: '🏙️', bg: 'bg-sky-50 border-sky-200 text-sky-900' },
            { title: 'Cyclone', icon: '🌀', bg: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
            { title: 'Heatwave', icon: '☀️', bg: 'bg-amber-50 border-amber-200 text-amber-900' },
            { title: 'Landslide', icon: '⛰️', bg: 'bg-stone-50 border-stone-200 text-stone-900' },
            { title: 'Earthquake', icon: '🏚️', bg: 'bg-red-50 border-red-200 text-red-900' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${item.bg} flex flex-col items-center text-center gap-2 shadow-xs`}>
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-bold">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary CTAs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">Join as a Community Volunteer</h2>
            <p className="text-sm text-sky-100 max-w-xl">
              Are you ready to assist in emergency response? Register today to offer skills, manage availability, and help local communities in times of crisis.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-white text-sky-700 hover:bg-sky-50 font-bold px-6 py-3 rounded-xl shadow-md text-sm shrink-0 flex items-center gap-2 transition-colors"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
