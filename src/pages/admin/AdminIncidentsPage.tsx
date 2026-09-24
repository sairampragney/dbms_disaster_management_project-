import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminIncidents } from '../../services/incidentService';
import { Incident, IncidentStatus, IncidentSeverity, IncidentType, INCIDENT_TYPE_LABELS, INCIDENT_STATUS_LABELS } from '../../types/incident';
import { AlertBadge } from '../../components/alerts/AlertBadge';
import { ShieldCheck, Filter, RefreshCw, ArrowRight } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AdminIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<IncidentType | 'ALL'>('ALL');

  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminIncidents({
        status: filterStatus,
        severity: filterSeverity,
        incidentType: filterType,
      });
      setIncidents(data);
    } catch (err) {
      console.error('Error fetching admin incidents:', err);
      setError('Failed to fetch incident queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [filterStatus, filterSeverity, filterType]);

  const formatDate = (dateVal?: Timestamp | Date | null) => {
    if (!dateVal) return 'N/A';
    const date = dateVal instanceof Timestamp ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/20 border border-sky-500/40 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Operational Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Incident Queue & Verification</h1>
          <p className="text-xs text-slate-300">Review citizen disaster reports, perform verification, and direct relief operations.</p>
        </div>

        <button
          onClick={loadIncidents}
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Filter Incidents</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | 'ALL')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">REPORTED (Pending Verification)</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as IncidentSeverity | 'ALL')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Incident Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as IncidentType | 'ALL')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Types</option>
              {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading incident queue...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-600">{error}</div>
        ) : incidents.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No incident reports matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Severity & Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Reported At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <AlertBadge severity={item.severity} size="sm" />
                        <span className="block font-bold text-slate-900">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{INCIDENT_TYPE_LABELS[item.incidentType]}</td>
                    <td className="px-4 py-3">{item.location}, {item.city}</td>
                    <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.status === 'VERIFIED' ? 'bg-sky-100 text-sky-800' :
                        item.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-900' :
                        item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'DISMISSED' ? 'bg-slate-100 text-slate-600' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {INCIDENT_STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/incidents/${item.id}`}
                        className="text-sky-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
