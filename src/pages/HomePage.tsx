import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, AlertTriangle, MapPin, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
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

      {/* Platform Features Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How The Platform Works</h2>
            <p className="text-sm text-slate-600 mt-1">A transparent end-to-end community safety ecosystem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Alert & Incident Reporting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizens view verified disaster alerts and report localized emergency incidents directly with location details.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Emergency Assistance Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizens submit urgent requests for food, water, medical aid, or evacuation and track real-time fulfillment status.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Volunteer & Shelter Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified community volunteers accept relief assignments while safe locations update live shelter capacities.
              </p>
            </div>
          </div>
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
