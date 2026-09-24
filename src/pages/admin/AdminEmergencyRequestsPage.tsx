import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminEmergencyRequests } from '../../services/emergencyRequestService';
import {
  EmergencyRequest,
  RequestStatus,
  RequestPriority,
  RequestType,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  PRIORITY_COLORS,
} from '../../types/emergencyRequest';
import {
  ShieldAlert,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  HeartHandshake,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export const AdminEmergencyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminEmergencyRequests({
        status: statusFilter,
        priority: priorityFilter,
        requestType: typeFilter,
      });
      setRequests(data);
    } catch (err) {
      console.error('Failed to load emergency requests:', err);
      setError('Unable to load emergency assistance queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter, typeFilter]);

  const formatDate = (dateVal: Timestamp | Date) => {
    if (!dateVal) return '';
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

  const filteredRequests = requests.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full text-xs font-semibold text-red-300">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Admin Emergency Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Emergency Assistance Queue</h1>
          <p className="text-xs text-slate-300">
            Review citizen emergency requests, acknowledge urgent cases, assign volunteers, and track fulfillment.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Queue Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL Priority</option>
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assistance Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(REQUEST_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Title, location, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Fetching emergency requests queue...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Matching Emergency Requests</h3>
          <p className="text-xs text-slate-500">No assistance requests match your selected filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Priority & Type</th>
                  <th className="p-4">Request Title & Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assignment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((item) => {
                  const priorityStyle = PRIORITY_COLORS[item.priority];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 space-y-1">
                        <span
                          className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                        >
                          {item.priority}
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {REQUEST_TYPE_LABELS[item.requestType]}
                        </p>
                      </td>

                      <td className="p-4 space-y-1 max-w-xs">
                        <Link
                          to={`/admin/emergency-requests/${item.id}`}
                          className="font-bold text-slate-900 hover:text-red-600 transition-colors block line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.location}, {item.city}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            item.status === 'ACKNOWLEDGED'
                              ? 'bg-sky-100 text-sky-800'
                              : item.status === 'ASSIGNED'
                              ? 'bg-indigo-100 text-indigo-800'
                              : item.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-900'
                              : item.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {REQUEST_STATUS_LABELS[item.status]}
                        </span>
                      </td>

                      <td className="p-4 text-[11px] font-mono text-slate-600">
                        {item.assignedVolunteerId ? (
                          <span className="text-indigo-700 font-semibold">#{item.assignedVolunteerId.slice(0, 8)}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="p-4 text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/emergency-requests/${item.id}`}
                          className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
