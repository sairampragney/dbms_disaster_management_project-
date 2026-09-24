import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminVolunteers, approveVolunteer, suspendVolunteer } from '../../services/volunteerService';
import {
  VolunteerProfile,
  VolunteerVerificationStatus,
  VolunteerAvailability,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
  VOLUNTEER_SKILL_LABELS,
} from '../../types/volunteer';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminVolunteersPage: React.FC = () => {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<VolunteerVerificationStatus | 'ALL'>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<VolunteerAvailability | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminVolunteers({
        verificationStatus: statusFilter,
        availabilityStatus: availabilityFilter,
      });
      setVolunteers(data);
    } catch (err) {
      console.error('Failed to load volunteers directory:', err);
      setError('Unable to load volunteer application registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter, availabilityFilter]);

  const handleApprove = async (vol: VolunteerProfile) => {
    if (!user) return;
    setError(null);
    try {
      await approveVolunteer(vol.userId, user.uid);
      setActionSuccess(`Volunteer '${vol.fullName}' approved successfully.`);
      await fetchVolunteers();
    } catch (err: any) {
      console.error('Approve error:', err);
      setError(err.message || 'Failed to approve volunteer.');
    }
  };

  const handleSuspend = async (vol: VolunteerProfile) => {
    if (!window.confirm(`Suspend volunteer '${vol.fullName}'?`)) return;
    setError(null);
    try {
      await suspendVolunteer(vol.userId);
      setActionSuccess(`Volunteer '${vol.fullName}' suspended.`);
      await fetchVolunteers();
    } catch (err: any) {
      console.error('Suspend error:', err);
      setError(err.message || 'Failed to suspend volunteer.');
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      vol.fullName.toLowerCase().includes(q) ||
      vol.city.toLowerCase().includes(q) ||
      vol.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Volunteer Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Manage Volunteer Corps</h1>
          <p className="text-xs text-slate-300">
            Review citizen volunteer applications, approve dispatch eligibility, and manage active status.
          </p>
        </div>

        <button
          onClick={fetchVolunteers}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Registry</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Volunteer Registry Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">All Availability</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Name, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Fetching volunteer directory...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <UserCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Volunteers Found</h3>
          <p className="text-xs text-slate-500">No volunteer applications match your selected filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Volunteer Name & Phone</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Skills</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVolunteers.map((item) => {
                  const statusStyle = VERIFICATION_STATUS_COLORS[item.verificationStatus];
                  return (
                    <tr key={item.userId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 space-y-0.5">
                        <Link
                          to={`/admin/volunteers/${item.userId}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors block text-sm"
                        >
                          {item.fullName}
                        </Link>
                        <p className="text-[11px] text-slate-500 font-mono">{item.phone}</p>
                      </td>

                      <td className="p-4 text-[11px] text-slate-600">
                        {item.city}, {item.state}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {VERIFICATION_STATUS_LABELS[item.verificationStatus]}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs truncate text-[11px] text-slate-500">
                        {item.skills.map((s) => VOLUNTEER_SKILL_LABELS[s] || s).join(', ')}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.verificationStatus === 'PENDING' && (
                            <button
                              onClick={() => handleApprove(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}
                          {item.verificationStatus === 'APPROVED' && (
                            <button
                              onClick={() => handleSuspend(item)}
                              className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 border border-slate-300"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          )}
                          <Link
                            to={`/admin/volunteers/${item.userId}`}
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
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
