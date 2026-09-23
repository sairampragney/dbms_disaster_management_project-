import React, { useState, useEffect } from 'react';
import { getPublicAlerts } from '../services/alertService';
import { Alert, DisasterType, AlertSeverity, DISASTER_TYPE_LABELS } from '../types/alert';
import { AlertCard } from '../components/alerts/AlertCard';
import { AlertTriangle, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterDisaster, setFilterDisaster] = useState<DisasterType | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicAlerts({
        disasterType: filterDisaster,
        severity: filterSeverity,
        state: filterState,
        status: 'ACTIVE',
      });
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Unable to load disaster alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterDisaster, filterSeverity, filterState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Verified Public Disaster Warnings</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Public Disaster Alerts</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time emergency advisories and safety recommendations across Indian states and union territories.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Filter Advisories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Disaster Category</label>
            <select
              value={filterDisaster}
              onChange={(e) => setFilterDisaster(e.target.value as DisasterType | 'ALL')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(DISASTER_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Severity Level</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'ALL')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Emergency</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">State / Region</label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All States</option>
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Kerala">Kerala</option>
              <option value="Delhi">Delhi</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Feed */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading live disaster alerts...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="text-xs font-bold text-red-800">{error}</p>
          <button onClick={fetchAlerts} className="text-xs text-sky-600 hover:underline font-bold">Try Again</button>
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3 p-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Active Public Alerts</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently no active public warnings matching your criteria. Stay vigilant and check local emergency guidelines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
};
