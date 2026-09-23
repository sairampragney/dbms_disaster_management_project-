import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldAlert, PhoneCall, AlertTriangle, MapPin, HeartHandshake, Info } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Banner Notice */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-medium text-center flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          Independent technology platform. For immediate government emergency response in India, call <strong>112</strong> directly.
        </span>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-sky-600 text-white p-2 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 block leading-tight">Disaster Alert</span>
              <span className="text-xs text-sky-600 font-medium block">Community Response India</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/alerts" className="hover:text-sky-600 transition-colors flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Public Alerts</span>
            </Link>
            <Link to="/safe-locations" className="hover:text-sky-600 transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Safe Locations</span>
            </Link>
            <Link to="/emergency" className="hover:text-sky-600 transition-colors flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-sky-500" />
              <span>Emergency Help</span>
            </Link>
            <Link to="/about" className="hover:text-sky-600 transition-colors flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>About</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="tel:112"
              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 112</span>
            </a>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-slate-700 hover:text-sky-600 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-white text-base">Disaster Alert & Response</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India-first emergency platform for public alerts, incident reporting, safe shelter discovery, and coordinated community relief.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Emergency Helplines (India)</h4>
            <ul className="space-y-2 text-xs">
              <li>National Emergency Number: <strong className="text-white">112</strong></li>
              <li>Police: <strong className="text-white">100</strong></li>
              <li>Fire: <strong className="text-white">101</strong></li>
              <li>Ambulance: <strong className="text-white">108</strong></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/alerts" className="hover:text-white transition-colors">Public Disaster Alerts</Link></li>
              <li><Link to="/safe-locations" className="hover:text-white transition-colors">Safe Locations & Shelters</Link></li>
              <li><Link to="/emergency" className="hover:text-white transition-colors">Request Assistance</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About System</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Demonstration Focus</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Primary region: <strong>Hyderabad, Telangana</strong>. Supports pan-India disaster categories: Flood, Cyclone, Heatwave, Landslide, Earthquake.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Disaster Alert & Community Response. Built with React, Vite, TypeScript, and Firebase.
        </div>
      </footer>
    </div>
  );
};
